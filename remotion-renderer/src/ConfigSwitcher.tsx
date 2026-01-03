import React, {useEffect, useState} from 'react';
import {EnvScrollTemplate} from './EnvScrollTemplate';

type Config = any;

export const ConfigSwitcher: React.FC<{defaultConfigName?: string}> = ({defaultConfigName = 'envconfig'}) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [available, setAvailable] = useState<string[] | null>(null);
  const [currentName, setCurrentName] = useState<string>(defaultConfigName);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // load manifest of configs
    let cancelled = false;
    fetch('/static/configs/index.json')
      .then((r) => r.ok ? r.json() : [])
      .then((list: string[]) => {
        if (cancelled) return;
        setAvailable(list || []);
      })
      .catch(() => {
        if (!cancelled) setAvailable([defaultConfigName]);
      });
    return () => { cancelled = true; };
  }, [defaultConfigName]);

  useEffect(() => {
    // determine initial name from URL if possible
    try {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('config') || defaultConfigName;
      setCurrentName(name);
    } catch (e) {
      setCurrentName(defaultConfigName);
    }
  }, [defaultConfigName]);

  useEffect(() => {
    let cancelled = false;
    let lastText: string | null = null;
    const url = `/static/configs/${currentName}.json`;

    const parseSrt = (text: string) => {
      // very small SRT parser: return array of {text, startSec, durationSec}
      const blocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
      const cues: any[] = [];
      for (const block of blocks) {
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const timeLine = lines[1] || lines[0];
          const m = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
          if (m) {
            const toSecs = (t: string) => {
              const [hh, mm, rest] = t.split(':');
              const [ss, ms] = rest.split(',');
              return Number(hh) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms) / 1000;
            };
            const start = toSecs(m[1]);
            const end = toSecs(m[2]);
            const textLines = lines.slice(2).length ? lines.slice(2) : [lines.slice(0,1).join(' ')];
            cues.push({text: textLines.join('\n'), startSec: start, durationSec: Math.max(0.1, end - start)});
          }
        }
      }
      return cues;
    };

    const loadOnce = async () => {
      try {
        const r = await fetch(url, {cache: 'no-store'});
        if (!r.ok) throw new Error('Failed to load config ' + url);
        const text = await r.text();
        if (cancelled) return;
        if (lastText !== text) {
          lastText = text;
          try {
            const j = JSON.parse(text);
            // Support two formats:
            // 1) { images: [...], bgMusic: '...', ... }
            // 2) { config: { images: [...], ... } }
            const normalized = j && j.config ? j.config : j;
            // if srt is provided but subtitles missing or empty, fetch and parse srt
            if (normalized && normalized.srt && (!normalized.subtitles || normalized.subtitles.length === 0)) {
              try {
                const srtUrl = `/static/${normalized.srt.replace(/^static\//, '')}`;
                const sr = await fetch(srtUrl, {cache: 'no-store'});
                if (sr.ok) {
                  const srtText = await sr.text();
                  const cues = parseSrt(srtText);
                  normalized.subtitles = cues;
                }
              } catch (e) {
                console.warn('Failed to load/parse srt', e);
              }
            }
            // normalize subtitles entries to have text/startSec/durationSec
            if (normalized && normalized.subtitles && Array.isArray(normalized.subtitles)) {
              normalized.subtitles = normalized.subtitles.map((it: any) => {
                if (typeof it === 'string') return {text: it, startSec: 0, durationSec: 3};
                return it;
              });
            }
            console.debug('Config loaded', currentName, {hasSubtitles: !!(normalized && normalized.subtitles && normalized.subtitles.length), subtitlesCount: normalized && normalized.subtitles ? normalized.subtitles.length : 0});
            setConfig(normalized);
            setLastStatus(`Loaded ${currentName} (${normalized && normalized.subtitles ? normalized.subtitles.length : 0} subtitles)`);
            setLastError(null);
          } catch (e) {
            console.warn('Invalid JSON in', url, e);
            setConfig(null);
            setLastStatus('invalid-json');
            setLastError(String(e));
          }
        }
      } catch (err) {
        console.warn(err);
        setConfig(null);
        setLastStatus('load-failed');
        setLastError(String(err));
      }
    };

    // initial load
    loadOnce();
    // poll for changes
    const iv = setInterval(() => {
      loadOnce();
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [currentName]);

  const switchTo = (name: string) => {
    setCurrentName(name);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('config', name);
      window.history.pushState({}, '', u.toString());
    } catch {
      // noop if not in browser
    }
  };

  if (!available) return <div style={{color: 'white'}}>Loading configs...</div>;

  // If running in non-browser environment (render CLI), fall back to defaultProps if provided
  if (typeof window === 'undefined') {
    return config ? <EnvScrollTemplate config={config} /> : null;
  }

  return (
    <div style={{width: '100%', height: '100%', position: 'relative'}}>
      <div style={{position: 'absolute', left: 20, top: 20, zIndex: 9999}}>
        <div style={{display: 'flex', gap: 8, flexDirection: 'column'}}>
          {available.map((name) => (
            <button
              key={name}
              onClick={() => switchTo(name)}
              style={{
                padding: '8px 12px',
                background: name === currentName ? '#1f6feb' : 'rgba(255,255,255,0.08)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div style={{marginTop: 8, color: 'white', fontSize: 12}}>
          <div>Status: {lastStatus ?? 'idle'}</div>
          {lastError ? <div style={{color: '#ff9b9b'}}>Error: {lastError}</div> : null}
        </div>
      </div>
      {config ? <EnvScrollTemplate config={config} /> : <div style={{color: 'white'}}>Loading config...</div>}
    </div>
  );
};

export default ConfigSwitcher;
