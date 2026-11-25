window.__ModuleLoader__.load({
  id: 'dsh-quick-reply-bar',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'quickReplyBar';
    const STORE_KEY = 'dsh-quick-reply-bar:v1';
    const UI_KEY = 'dsh-quick-reply-bar:ui:v1';
    const MAX_ITEMS = 60;
    const MAX_LABEL = 40;
    const MAX_TEXT = 4000;

    /* ---------------------------------------------------------------- text */

    const zh = {
      title: '快捷回复',
      collapsed: '快捷回复',
      expand: '展开快捷回复',
      collapse: '收起快捷回复',
      manage: '管理快捷回复',
      panelTitle: '快捷回复管理',
      done: '完成',
      add: '＋ 添加一条',
      remove: '删除',
      up: '上移',
      down: '下移',
      restoreDefaults: '恢复默认',
      labelPlaceholder: '按钮上显示的字（可留空）',
      textPlaceholder: '点这个按钮时要发送的内容',
      empty: '还没有快捷回复，点下面的“添加一条”。',
      emptyShort: '还没有快捷回复',
      hint: '点按钮就直接发送。按钮字留空时，用内容开头的字当按钮名。',
      busy: '正在发送，稍等一下',
    };

    const en = {
      title: 'Quick replies',
      collapsed: 'Quick replies',
      expand: 'Show quick replies',
      collapse: 'Hide quick replies',
      manage: 'Edit quick replies',
      panelTitle: 'Quick replies',
      done: 'Done',
      add: '+ Add reply',
      remove: 'Remove',
      up: 'Move up',
      down: 'Move down',
      restoreDefaults: 'Restore defaults',
      labelPlaceholder: 'Button caption (optional)',
      textPlaceholder: 'Text sent when this button is clicked',
      empty: 'No quick replies yet. Use “Add reply” below.',
      emptyShort: 'No quick replies yet',
      hint: 'A click sends the reply straight away. With no caption the text itself labels the button.',
      busy: 'Sending, one moment',
    };

    const PRESETS = {
      zh: [
        ['继续', '继续'],
        ['详细点', '详细说说，把关键步骤讲清楚'],
        ['简短点', '简短点，只给结论'],
        ['换个思路', '换个思路，给两个不同的方案'],
      ],
      en: [
        ['Continue', 'Continue'],
        ['More detail', 'Explain in more detail, step by step'],
        ['Shorter', 'Keep it short, conclusion first'],
        ['Alternative', 'Try a different approach and give me two options'],
      ],
    };

    function detectLang() {
      try {
        const nav = String((typeof navigator !== 'undefined' && navigator.language) || '').toLowerCase();
        if (nav.indexOf('zh') === 0) return 'zh';
        if (nav) return 'en';
        const doc = String((document.documentElement && document.documentElement.lang) || '').toLowerCase();
        return doc.indexOf('zh') === 0 ? 'zh' : 'en';
      } catch (error) {
        return 'zh';
      }
    }

    function translatorOf(props) {
      const source = props && typeof props.t === 'function' ? props.t : null;
      const fallback = detectLang() === 'zh' ? zh : en;
      return function t(key) {
        if (source !== null) {
          try {
            const value = source(key);
            if (typeof value === 'string' && value !== '') return value;
          } catch (error) {
            /* the locale service may not know this key: fall through */
          }
        }
        return typeof fallback[key] === 'string' ? fallback[key] : key;
      };
    }

    /* --------------------------------------------------------------- store */

    function newId() {
      return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function readJson(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? null : JSON.parse(raw);
      } catch (error) {
        return null;
      }
    }

    function writeJson(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        /* storage full or blocked: the bar still works for this session */
      }
    }

    function seedItems() {
      const preset = PRESETS[detectLang()] || PRESETS.zh;
      return preset.map(function (pair, index) {
        return { id: 'seed-' + index, label: pair[0], text: pair[1] };
      });
    }

    function normalizeItems(raw) {
      const items = [];
      for (let index = 0; index < raw.length && items.length < MAX_ITEMS; index += 1) {
        const entry = raw[index];
        if (entry === null || typeof entry !== 'object') continue;
        items.push({
          id: typeof entry.id === 'string' && entry.id !== '' ? entry.id : newId(),
          label: typeof entry.label === 'string' ? entry.label.slice(0, MAX_LABEL) : '',
          text: typeof entry.text === 'string' ? entry.text.slice(0, MAX_TEXT) : '',
        });
      }
      return items;
    }

    function loadItems() {
      const stored = readJson(STORE_KEY);
      if (stored !== null && Array.isArray(stored.items)) return normalizeItems(stored.items);
      return seedItems();
    }

    function saveItems(items) {
      writeJson(STORE_KEY, { v: 1, items: items });
    }

    /* ---------------------------------------------------------- input state */

    const selectPhase = function (state) {
      return state ? state.phase : undefined;
    };
    const selectDraft = function (state) {
      return state && typeof state.draft === 'string' ? state.draft : '';
    };

    function useInputSignals(props) {
      const useInput = props && typeof props.useInput === 'function' ? props.useInput : null;
      const snapshot = props && props.input && typeof props.input === 'object' ? props.input : null;
      // props.useInput is present or absent for the whole mount, so hook order stays stable.
      const phase = useInput !== null ? useInput(selectPhase) : snapshot ? snapshot.phase : 'plain';
      const draft =
        useInput !== null
          ? useInput(selectDraft)
          : snapshot && typeof snapshot.draft === 'string'
            ? snapshot.draft
            : '';
      return {
        phase: typeof phase === 'string' && phase !== '' ? phase : 'plain',
        draft: typeof draft === 'string' ? draft : '',
      };
    }

    /* ------------------------------------------------------------- graphics */

    function SparkIcon() {
      return h(
        'svg',
        {
          className: 'qrb-svg',
          viewBox: '0 0 16 16',
          width: 12,
          height: 12,
          'aria-hidden': 'true',
          focusable: 'false',
        },
        h('path', {
          d: 'M8 1.4 9.55 6.45 14.6 8 9.55 9.55 8 14.6 6.45 9.55 1.4 8 6.45 6.45Z',
          fill: 'currentColor',
        }),
      );
    }

    function ChevronIcon() {
      return h(
        'svg',
        {
          className: 'qrb-svg',
          viewBox: '0 0 16 16',
          width: 12,
          height: 12,
          'aria-hidden': 'true',
          focusable: 'false',
        },
        h('path', {
          d: 'M4 6.2 8 10.2 12 6.2',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    /* ------------------------------------------------------------ component */

    function captionOf(item) {
      const label = item.label.trim();
      if (label !== '') return label;
      const flat = item.text.replace(/\s+/g, ' ').trim();
      return flat.length > 18 ? flat.slice(0, 18) + '…' : flat;
    }

    function findComposerAnchor() {
      try {
        // Prefer the input card itself: walk up from the editor to the first
        // painted ancestor, which is the card the text sits in.
        const editor = document.querySelector('[contenteditable="true"], textarea');
        if (editor && typeof editor.getBoundingClientRect === 'function') {
          let node = editor;
          for (let depth = 0; depth < 8 && node; depth += 1) {
            const style = typeof getComputedStyle === 'function' ? getComputedStyle(node) : null;
            const background = style ? style.backgroundColor : '';
            const painted = background && background !== 'transparent' && background !== 'rgba(0, 0, 0, 0)';
            const rect = typeof node.getBoundingClientRect === 'function' ? node.getBoundingClientRect() : null;
            if (painted && rect && rect.width > 240) return { left: rect.left, right: rect.right };
            node = node.parentElement;
          }
        }
        const stack = document.querySelector('[class*="composerStack"]');
        if (stack && typeof stack.getBoundingClientRect === 'function') {
          const rect = stack.getBoundingClientRect();
          if (rect.width > 0) return { left: rect.left, right: rect.right };
        }
        const hero = document.querySelector('[class*="composerHero"]');
        if (hero && typeof hero.getBoundingClientRect === 'function') {
          const rect = hero.getBoundingClientRect();
          const style = typeof getComputedStyle === 'function' ? getComputedStyle(hero) : null;
          const padLeft = parseFloat(style && style.paddingLeft) || 0;
          const padRight = parseFloat(style && style.paddingRight) || 0;
          if (rect.width > 0) return { left: rect.left + padLeft, right: rect.right - padRight };
        }
        if (editor && typeof editor.getBoundingClientRect === 'function') {
          const rect = editor.getBoundingClientRect();
          if (rect.width > 0) return { left: rect.left, right: rect.right };
        }
      } catch (error) {
        /* layout probe is best effort */
      }
      return null;
    }
    function Dock(props) {
      const t = translatorOf(props);
      const actions = props.inputActions;
      const [items, setItems] = React.useState(loadItems);
      const [expanded, setExpanded] = React.useState(function () {
        const ui = readJson(UI_KEY);
        return !!(ui && ui.expanded === true);
      });
      const [editing, setEditing] = React.useState(false);
      const signals = useInputSignals(props);
      const busy = signals.phase !== 'plain';
      const stashRef = React.useRef(null);
      const rootRef = React.useRef(null);

      React.useEffect(
        function () {
          writeJson(UI_KEY, { expanded: expanded });
        },
        [expanded],
      );

      const commit = React.useCallback(function (next) {
        setItems(next);
        saveItems(next);
      }, []);

      const canSend =
        !!actions && typeof actions.setDraft === 'function' && typeof actions.submit === 'function';

      const send = React.useCallback(
        function (text) {
          if (!canSend || busy) return;
          const clean = typeof text === 'string' ? text : '';
          if (clean.trim() === '') return;
          stashRef.current = signals.draft.trim() !== '' ? signals.draft : null;
          try {
            actions.setDraft(clean);
            actions.submit();
          } catch (error) {
            console.error('[quick-reply-bar] send failed', error);
          }
        },
        [actions, busy, canSend, signals.draft],
      );

      // Put a half-written draft back once the phrase has been sent.
      React.useEffect(
        function () {
          if (busy) return;
          const saved = stashRef.current;
          if (saved === null) return;
          if (signals.draft !== '') return;
          stashRef.current = null;
          if (canSend) actions.setDraft(saved);
        },
        [actions, busy, canSend, signals.draft],
      );

      // The dock spans the whole column while the composer card does not, so
      // mirror the card's horizontal edges or the bar drifts to the far left.
      React.useEffect(
        function () {
          const node = rootRef.current;
          if (!node || typeof node.getBoundingClientRect !== 'function') return undefined;
          let timer = 0;
          let attempts = 0;
          let settled = false;
          function align() {
            const anchor = findComposerAnchor();
            if (!anchor) return false;
            const rect = node.getBoundingClientRect();
            if (!rect || !rect.width) return false;
            const left = Math.max(0, Math.round(anchor.left - rect.left));
            const right = Math.max(0, Math.round(rect.right - anchor.right));
            node.style.paddingLeft = left + 'px';
            node.style.paddingRight = right + 'px';
            return true;
          }
          function tick() {
            if (align()) {
              settled = true;
              return;
            }
            attempts += 1;
            if (attempts > 40) return;
            timer = window.setTimeout(tick, 200);
          }
          tick();
          function onResize() {
            settle();
          }
          function settle() {
            if (!align() && !settled) tick();
          }
          window.addEventListener('resize', onResize);
          let observer = null;
          if (typeof ResizeObserver === 'function' && node.parentElement) {
            observer = new ResizeObserver(function () {
              align();
            });
            observer.observe(node.parentElement);
          }
          return function () {
            if (timer) window.clearTimeout(timer);
            window.removeEventListener('resize', onResize);
            if (observer) observer.disconnect();
          };
        },
        [expanded, editing],
      );
      function patch(id, changes) {
        commit(
          items.map(function (item) {
            return item.id === id ? Object.assign({}, item, changes) : item;
          }),
        );
      }

      function addItem() {
        if (items.length >= MAX_ITEMS) return;
        commit(items.concat([{ id: newId(), label: '', text: '' }]));
      }

      function removeItem(id) {
        commit(
          items.filter(function (item) {
            return item.id !== id;
          }),
        );
      }

      function moveItem(index, delta) {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = items.slice();
        const moved = next.splice(index, 1)[0];
        next.splice(target, 0, moved);
        commit(next);
      }

      function toggleEditing() {
        setEditing(function (value) {
          return !value;
        });
      }

      const sendable = React.useMemo(
        function () {
          return items.filter(function (item) {
            return item.text.trim() !== '';
          });
        },
        [items],
      );

      if (!expanded) {
        return h(
          'div',
          { className: 'qrb-root', ref: rootRef },
          h(
            'button',
            {
              type: 'button',
              className: 'qrb-pill',
              'aria-expanded': false,
              'aria-label': t('expand'),
              title: t('expand'),
              onClick: function () {
                setExpanded(true);
              },
            },
            h(SparkIcon),
            h('span', { className: 'qrb-pill-label' }, t('collapsed')),
            sendable.length > 0
              ? h('span', { className: 'qrb-pill-count' }, String(sendable.length))
              : null,
          ),
        );
      }

      const strip =
        sendable.length === 0
          ? h('span', { className: 'qrb-empty' }, t('emptyShort'))
          : sendable.map(function (item) {
              return h(
                'button',
                {
                  key: item.id,
                  type: 'button',
                  className: 'qrb-chip',
                  disabled: busy,
                  title: busy ? t('busy') : item.text,
                  onClick: function () {
                    send(item.text);
                  },
                },
                captionOf(item),
              );
            });

      const rows = items.map(function (item, index) {
        return h(
          'div',
          { className: 'qrb-row', key: item.id },
          h(
            'div',
            { className: 'qrb-fields' },
            h('input', {
              className: 'qrb-input',
              type: 'text',
              value: item.label,
              maxLength: MAX_LABEL,
              placeholder: t('labelPlaceholder'),
              'aria-label': t('labelPlaceholder'),
              onChange: function (event) {
                patch(item.id, { label: event.target.value });
              },
            }),
            h('textarea', {
              className: 'qrb-textarea',
              value: item.text,
              maxLength: MAX_TEXT,
              rows: 2,
              placeholder: t('textPlaceholder'),
              'aria-label': t('textPlaceholder'),
              onChange: function (event) {
                patch(item.id, { text: event.target.value });
              },
            }),
          ),
          h(
            'div',
            { className: 'qrb-tools' },
            h(
              'button',
              {
                type: 'button',
                className: 'qrb-icon qrb-icon-sm',
                disabled: index === 0,
                title: t('up'),
                'aria-label': t('up'),
                onClick: function () {
                  moveItem(index, -1);
                },
              },
              '↑',
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'qrb-icon qrb-icon-sm',
                disabled: index === items.length - 1,
                title: t('down'),
                'aria-label': t('down'),
                onClick: function () {
                  moveItem(index, 1);
                },
              },
              '↓',
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'qrb-icon qrb-icon-sm qrb-danger',
                title: t('remove'),
                'aria-label': t('remove'),
                onClick: function () {
                  removeItem(item.id);
                },
              },
              '×',
            ),
          ),
        );
      });

      const panel = h(
        'div',
        { className: 'qrb-panel' },
        h(
          'div',
          { className: 'qrb-panel-head' },
          h('span', { className: 'qrb-panel-title' }, t('panelTitle')),
          h(
            'button',
            {
              type: 'button',
              className: 'qrb-link',
              onClick: function () {
                commit(seedItems());
              },
            },
            t('restoreDefaults'),
          ),
        ),
        h('div', { className: 'qrb-panel-hint' }, t('hint')),
        rows.length === 0
          ? h('div', { className: 'qrb-panel-empty' }, t('empty'))
          : h('div', { className: 'qrb-rows' }, rows),
        h(
          'button',
          {
            type: 'button',
            className: 'qrb-add',
            onClick: addItem,
          },
          t('add'),
        ),
      );

      return h(
        'div',
        { className: 'qrb-root qrb-root-expanded', ref: rootRef },
        h(
          'button',
          {
            type: 'button',
            className: 'qrb-icon',
            'aria-expanded': true,
            'aria-label': t('collapse'),
            title: t('collapse'),
            onClick: function () {
              setEditing(false);
              setExpanded(false);
            },
          },
          h(ChevronIcon),
        ),
        editing ? panel : h('div', { className: 'qrb-strip' }, strip),
        h(
          'button',
          {
            type: 'button',
            className: editing ? 'qrb-chip qrb-chip-accent' : 'qrb-icon',
            'aria-label': t('manage'),
            title: t('manage'),
            onClick: toggleEditing,
          },
          editing ? t('done') : '＋',
        ),
      );
    }

    /* ----------------------------------------------------------------- css */

    const CSS = [
      '.qrb-root{display:flex;align-items:center;gap:6px;width:min(calc(var(--dsh-composer-card-max-width, 952px) + 2 * var(--dsh-composer-side-clearance, 16px)),100%);min-width:0;box-sizing:border-box;margin-inline:auto;padding:0 var(--dsh-composer-side-clearance, 16px) 6px;font-size:12px;line-height:1}',
      '.qrb-pill,.qrb-chip,.qrb-icon,.qrb-add,.qrb-link{font:inherit;font-size:12px;line-height:1;-webkit-appearance:none;appearance:none;cursor:pointer;user-select:none;transition:background-color .12s ease,color .12s ease,border-color .12s ease}',
      '.qrb-pill{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 11px 0 9px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.12));background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-secondary,#6b6b6b)}',
      '.qrb-pill:hover{color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.05));border-color:var(--dsw-alias-border-l2,rgba(0,0,0,.2))}',
      '.qrb-pill:focus-visible,.qrb-chip:focus-visible,.qrb-icon:focus-visible,.qrb-add:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2f6fed);outline-offset:1px}',
      '.qrb-pill-count{font-size:10px;opacity:.6}',
      '.qrb-svg{flex:0 0 auto;display:block}',
      '.qrb-strip{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;padding:1px}',
      '.qrb-strip::-webkit-scrollbar{height:0;width:0}',
      '.qrb-chip{flex:0 0 auto;max-width:260px;height:26px;padding:0 11px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.12));background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.qrb-chip:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.05));border-color:var(--dsw-alias-border-l2,rgba(0,0,0,.2))}',
      '.qrb-chip:disabled,.qrb-icon:disabled{opacity:.45;cursor:default}',
      '.qrb-chip-accent{color:var(--dsw-alias-brand-primary,#2f6fed);border-color:var(--dsw-alias-brand-primary,#2f6fed);background:transparent}',
      '.qrb-icon{width:26px;height:26px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;padding:0;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#6b6b6b);font-size:13px}',
      '.qrb-icon:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}',
      '.qrb-icon-sm{width:22px;height:22px;font-size:12px;border-radius:6px}',
      '.qrb-danger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary,#d33)}',
      '.qrb-empty{flex:1 1 auto;color:var(--dsw-alias-label-secondary,#6b6b6b);padding:0 4px}',
      '.qrb-panel{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.12));background:var(--dsw-alias-bg-layer-1,transparent)}',
      '.qrb-panel-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.qrb-panel-title{color:var(--dsw-alias-label-primary,#111);font-weight:600}',
      '.qrb-panel-hint{color:var(--dsw-alias-label-secondary,#6b6b6b);font-size:11px;line-height:1.45}',
      '.qrb-link{border:0;background:transparent;padding:0;color:var(--dsw-alias-label-secondary,#6b6b6b);text-decoration:underline;text-underline-offset:2px}',
      '.qrb-link:hover{color:var(--dsw-alias-label-primary,#111)}',
      '.qrb-rows{display:flex;flex-direction:column;gap:6px;max-height:34vh;overflow-y:auto;padding-right:2px}',
      '.qrb-row{display:flex;align-items:flex-start;gap:6px}',
      '.qrb-fields{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}',
      '.qrb-tools{display:flex;flex-direction:column;gap:2px}',
      '.qrb-input,.qrb-textarea{width:100%;box-sizing:border-box;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-bg-base,transparent);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.12));border-radius:8px;padding:5px 8px;outline:none}',
      '.qrb-textarea{resize:vertical;min-height:34px;line-height:1.45;font-family:inherit}',
      '.qrb-input:focus,.qrb-textarea:focus{border-color:var(--dsw-alias-brand-primary,#2f6fed)}',
      '.qrb-panel-empty{color:var(--dsw-alias-label-secondary,#6b6b6b);padding:2px 0 4px}',
      '.qrb-add{align-self:flex-start;height:24px;padding:0 10px;border-radius:999px;border:1px dashed var(--dsw-alias-border-l2,rgba(0,0,0,.2));background:transparent;color:var(--dsw-alias-label-secondary,#6b6b6b)}',
      '.qrb-add:hover{color:var(--dsw-alias-label-primary,#111);border-color:var(--dsw-alias-brand-primary,#2f6fed)}',
    ].join('\n');

    const CSS_TAG = 'dsh-quick-reply-bar/client.css';

    function injectStyles() {
      if (typeof document === 'undefined' || !document.head) return function () {};
      if (document.head.querySelector('style[data-plugin-css="' + CSS_TAG + '"]')) return function () {};
      const style = document.createElement('style');
      style.dataset.plugin = 'dsh-quick-reply-bar';
      style.dataset.pluginCss = CSS_TAG;
      style.textContent = CSS;
      document.head.appendChild(style);
      return function () {
        style.remove();
      };
    }

    /* --------------------------------------------------------------- apply */

    function apply(ctx) {
      ctx.effect(function () {
        return ctx.locale.register(NS, { zh: zh, en: en });
      }, 'quick-reply-bar: dictionaries');

      ctx.effect(function () {
        return injectStyles();
      }, 'quick-reply-bar: styles');

      ctx.slots.inject('conversation.input.dock', function () {
        return ctx.slots.register(
          {
            name: 'conversation.input.dock',
            id: 'quick-reply-bar',
            order: 15,
            locale: NS,
          },
          Dock,
        );
      });
    }

    return {
      name: 'quick-reply-bar',
      inject: ['slots', 'locale'],
      apply: apply,
    };
  },
});
