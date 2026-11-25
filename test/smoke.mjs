import fs from "node:fs";
import { fileURLToPath } from "node:url";
const SRC = fileURLToPath(new URL("../client.js", import.meta.url));
let captured = null;
const store = new Map();
const LS = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
globalThis.window = { __ModuleLoader__: { load: (m) => { captured = m; } }, localStorage: LS };
globalThis.localStorage = LS;
Object.defineProperty(globalThis, 'navigator', { value: { language: 'zh-CN' }, configurable: true });
const styleEl = { dataset: {}, textContent: '' };
globalThis.document = { documentElement: { lang: 'zh-CN' }, createElement: () => styleEl, head: { appendChild: () => {}, querySelector: () => null }, querySelector: () => null };

let slots = []; let cursor = 0;
const React = {
  createElement: (type, props, ...ch) => ({ type, props: { ...(props || {}), children: ch.length > 1 ? ch : ch[0] } }),
  useState: (init) => { const i = cursor++; if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init; return [slots[i], (v) => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; },
  useRef: (v) => { const i = cursor++; if (!(i in slots)) slots[i] = { current: v }; return slots[i]; },
  useEffect: (fn) => { try { fn(); } catch (e) {} },
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  Fragment: 'Fragment',
};
const calls = [];
const props = { t: (k) => k, useInput: (sel) => sel({ phase: 'plain', draft: '' }), inputActions: { setDraft: (x) => calls.push(x), submit: () => calls.push('<submit>') }, session: { sessionId: 's1' }, sessionId: 's1' };

new Function('window', 'document', 'navigator', 'localStorage', fs.readFileSync(SRC, 'utf8'))(globalThis.window, globalThis.document, globalThis.navigator, globalThis.localStorage);
const mod = captured.factory((id) => { if (id === 'react') return React; throw new Error('bad require ' + id); });
let Comp = null;
mod.apply({ effect: (fn) => fn(), locale: { register: () => {} }, slots: { inject: (o, fn) => fn(), register: (o, c) => { Comp = c; } } });

function render() {
  cursor = 0;
  const out = { classes: [], nodes: [] };
  const tree = Comp(props);
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    const cls = n.props && n.props.className;
    if (typeof cls === 'string' && cls.includes('qrb-')) { out.classes.push(cls); out.nodes.push(n); }
    walk(n.props && n.props.children);
  })(tree);
  return out;
}
function count(r, cls) { return r.classes.filter((c) => c.split(' ').includes(cls)).length; }
function first(r, cls) { return r.nodes.find((n) => String(n.props.className).split(' ').includes(cls)); }

let r = render();
console.log('1 collapsed:', count(r, 'qrb-pill') === 1 && count(r, 'qrb-chip') === 0 ? 'PASS' : 'FAIL', '|', r.classes.join(','));
first(r, 'qrb-pill').props.onClick();
r = render();
console.log('2 expanded:', count(r, 'qrb-chip') === 4 ? 'PASS' : 'FAIL', '| chips', count(r, 'qrb-chip'), '| strip', count(r, 'qrb-strip'));
const manage = r.nodes.filter((n) => String(n.props.className).includes('qrb-icon')).pop();
manage.props.onClick();
r = render();
console.log('3 panel:', count(r, 'qrb-panel') === 1 ? 'PASS' : 'FAIL', '| textareas', count(r, 'qrb-textarea'), '| inputs', count(r, 'qrb-input'));
first(r, 'qrb-add').props.onClick();
r = render();
console.log('4 add row:', count(r, 'qrb-textarea') === 5 ? 'PASS' : 'FAIL', '| textareas', count(r, 'qrb-textarea'));
const tas = r.nodes.filter((n) => String(n.props.className).includes('qrb-textarea'));
tas[tas.length - 1].props.onChange({ target: { value: '帮我把这段代码加上注释' } });
r = render();
const doneBtn = r.nodes.filter((n) => String(n.props.className).includes('qrb-icon') || String(n.props.className).includes('accent')).pop();
doneBtn.props.onClick();
r = render();
console.log('5 after done:', count(r, 'qrb-chip') === 5 ? 'PASS' : 'FAIL', '| chips', count(r, 'qrb-chip'), '| panel', count(r, 'qrb-panel'));
const chips = r.nodes.filter((n) => String(n.props.className).split(' ').includes('qrb-chip'));
chips[chips.length - 1].props.onClick();
console.log('6 new chip sends:', JSON.stringify(calls) === JSON.stringify(['帮我把这段代码加上注释', '<submit>']) ? 'PASS' : 'FAIL', '|', JSON.stringify(calls));
console.log('7 persisted items:', JSON.parse(store.get('dsh-quick-reply-bar:v1')).items.length, '| ui:', store.get('dsh-quick-reply-bar:ui:v1'));
