// Client half of dsh-harmonyos-arkts.
//
// This file is authored as a COMPLETE DSH client bundle (no bundler): DSH serves
// it as a classic script and expects the exact
// `window.__ModuleLoader__.load({ id, factory })` wrapper, where the factory
// returns the Cordis plugin (`apply` / `inject`).
//
// `build-client.mjs` replaces the __PANEL_DATA__ placeholder with data read from
// the real knowledge base (references/, platform-baseline.md, arkts-review) and
// writes the result to lib/client.js — the path package.json must export as
// "./client". Edit this file, then run: node build-client.mjs
//
// Style notes: all colours come from DSH's own theme tokens (--dsw-alias-*) so
// the panel follows light/dark and matches the shell; CSS is inline because the
// /plugins route only serves client.js.

window.__ModuleLoader__.load({
  id: 'dsh-harmonyos-arkts',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    const React = require('react')
    const h = React.createElement
    const { useState } = React

    /** Shared by the sidebar rail entry and the main panel it opens. */
    const PANEL_ID = 'harmonyos-arkts'
    /** Locale dictionary namespace owned by this plugin. */
    const NS = 'harmonyosArkts'
    /** Guards the injected stylesheet against double-injection across HMR reloads. */
    const STYLE_ID = 'dsh-harmonyos-arkts/client.css'

    // --------------------------------------------------------------- data
    // Injected at build time by build-client.mjs from the real skill files.
    const DATA = /*__PANEL_DATA__*/ null

    // ---------------------------------------------------------------- css
    const CSS = [
      '.dshats{height:100%;overflow:auto;padding:16px 20px 32px;font-size:13px;line-height:1.6;',
      'color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}',
      '.dshats-hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px}',
      '.dshats-h1{font-size:15px;font-weight:600}',
      '.dshats-chip{font-size:11px;font-weight:500;padding:1px 7px;border-radius:999px;',
      'color:var(--dsw-alias-brand-primary);border:.5px solid var(--dsw-alias-brand-primary)}',
      '.dshats-sub{font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.dshats-sec{margin-top:20px}',
      '.dshats-sec-h{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;',
      'color:var(--dsw-alias-label-secondary);margin-bottom:8px}',
      '.dshats-card{border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;',
      'background:var(--dsw-alias-bg-layer-1);padding:10px 12px}',
      '.dshats-row{display:flex;gap:12px;align-items:baseline;padding:3px 0}',
      '.dshats-k{flex:0 0 92px;font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.dshats-v{flex:1;min-width:0;word-break:break-word}',
      '.dshats-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}',
      '.dshats-tree{border-left:.5px solid var(--dsw-alias-border-l1);margin-left:5px;padding-left:12px}',
      '.dshats-node{display:block;width:100%;text-align:left;border:0;background:none;cursor:pointer;',
      'padding:4px 6px;margin-left:-6px;border-radius:6px;color:inherit;font:inherit}',
      '.dshats-node:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dshats-node[data-open="1"]{background:var(--dsw-alias-bg-layer-2)}',
      '.dshats-file{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}',
      '.dshats-tag{margin-left:6px;font-size:10px;padding:0 5px;border-radius:4px;',
      'color:var(--dsw-alias-label-secondary);border:.5px solid var(--dsw-alias-border-l1)}',
      '.dshats-desc{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-secondary);',
      'margin:4px 0 2px 2px}',
      '.dshats-root{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}',
      '.dshats-btn{display:inline-flex;align-items:center;gap:6px;border-radius:8px;cursor:pointer;',
      'padding:7px 14px;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);',
      'background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2)}',
      '.dshats-btn:hover{border-color:var(--dsw-alias-brand-primary);',
      'color:var(--dsw-alias-brand-primary)}',
      '.dshats-btn[data-done="1"]{border-color:var(--dsw-alias-state-success-primary);',
      'color:var(--dsw-alias-state-success-primary)}',
      '.dshats-note{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:8px}',
      '.dshats-warn{font-size:11px;color:var(--dsw-alias-state-warn-primary);margin-top:8px}',
    ].join('')

    if (typeof document !== 'undefined') {
      const existing = document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']')
      if (existing === null) {
        const tag = document.createElement('style')
        tag.dataset.pluginCss = STYLE_ID
        tag.textContent = CSS
        document.head.appendChild(tag)
      }
    }

    /** Build the ready-to-send eight-axis review prompt from injected data. */
    function reviewPrompt () {
      const axes = DATA.axes.map((axis, index) => `${index + 1}. ${axis}`).join('\n')
      return [
        '用 arkts-review 技能审查本工作区的 .ets 代码，按八轴逐条过一遍：',
        '',
        axes,
        '',
        '要求：',
        '- 先读 build-profile.json5，确认 targetSdkVersion / compatibleSdkVersion，再判断 API 可用性；',
        '- API 26 的行为变更只在 targetSdkVersion >= 26.0.0 时生效，先确认门控再下结论；',
        '- 每个问题给出：文件:行、命中的轴、为什么错、改法；',
        '- 没有 .ets 文件时，先 glob 出本工作区的 .ets 并挑最近修改的一个，告诉我你选了哪个。',
      ].join('\n')
    }

    // ------------------------------------------------------------- components
    /** Sidebar rail glyph. Owner props are exactly { size, active }; the sidebar
     *  supplies the button, tooltip, aria and click — return a bare glyph. */
    function PanelIcon (props) {
      const size = props.size ?? 16
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        h('path', { d: 'M8 1.6 13.6 4.8v6.4L8 14.4 2.4 11.2V4.8Z' }),
        h('circle', { cx: 8, cy: 8, r: 2.1 }),
      )
    }

    /** `main` panel body. Owner props are {}; data is the build-time snapshot. */
    function PanelPage () {
      const [open, setOpen] = useState(null)
      const [copied, setCopied] = useState(false)
      const baseline = DATA.baseline

      const copyPrompt = () => {
        const text = reviewPrompt()
        const done = () => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2400)
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(done, done)
          return
        }
        // Fallback for a non-secure context where the async clipboard is absent.
        try {
          const area = document.createElement('textarea')
          area.value = text
          area.style.position = 'fixed'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          document.execCommand('copy')
          document.body.removeChild(area)
        } catch { /* nothing else we can do */ }
        done()
      }

      const baselineRows = [
        ['产品', baseline.product],
        ['当前基线', baseline.headline],
        ['发布时间', baseline.released],
        ['兼容下限', baseline.floor],
        ['DevEco', baseline.ide],
        ['SDK', baseline.sdk],
        ['核对日期', baseline.checked],
      ]

      return h(
        'div',
        { className: 'dshats' },
        h(
          'div',
          { className: 'dshats-hd' },
          h('span', { className: 'dshats-h1' }, DATA.title),
          h('span', { className: 'dshats-chip' }, baseline.headline),
        ),
        h('div', { className: 'dshats-sub' }, DATA.subtitle),

        h('div', { className: 'dshats-sec' }, 
          h('div', { className: 'dshats-sec-h' }, '知识基线'),
          h('div', { className: 'dshats-card' },
            baselineRows.map(([k, v]) => h('div', { className: 'dshats-row', key: k },
              h('span', { className: 'dshats-k' }, k),
              h('span', { className: 'dshats-v' }, v),
            )),
          ),
        ),

        h('div', { className: 'dshats-sec' },
          h('div', { className: 'dshats-sec-h' }, `速查表 references/ · ${DATA.references.length}`),
          h('div', { className: 'dshats-root' }, 'skills/harmonyos-development/references/'),
          h('div', { className: 'dshats-tree' },
            DATA.references.map(ref => h('div', { key: ref.file },
              h('button', {
                type: 'button',
                className: 'dshats-node',
                'data-open': open === ref.file ? '1' : '0',
                'aria-expanded': open === ref.file,
                onClick: () => setOpen(open === ref.file ? null : ref.file),
              },
                h('span', { className: 'dshats-file' }, ref.file),
                ref.index ? h('span', { className: 'dshats-tag' }, '索引') : null,
              ),
              open === ref.file
                ? h('div', { className: 'dshats-desc' },
                    h('div', null, ref.summary),
                    h('div', { className: 'dshats-sub', style: { marginTop: 4 } },
                      `${ref.bytes} B${ref.groups?.length ? ` · ${ref.groups.join(' / ')}` : ''}`),
                  )
                : null,
            )),
          ),
        ),

        h('div', { className: 'dshats-sec' },
          h('div', { className: 'dshats-sec-h' }, '八轴审查'),
          h('button', {
            type: 'button',
            className: 'dshats-btn',
            'data-done': copied ? '1' : '0',
            onClick: copyPrompt,
          }, copied ? '已复制审查提示词' : '把当前 .ets 丢进八轴审查'),
          h('div', { className: 'dshats-note' },
            copied
              ? '粘贴到输入框发送即可 —— 提示词已带上八轴与 targetSdkVersion 门控要求。'
              : `复制提示词（含八轴与 ${DATA.axes.length} 条审查要求），粘贴到输入框发送。`),
          DATA.degraded
            ? h('div', { className: 'dshats-warn' }, '部分数据未能从技能文件读取，显示的是兜底值。')
            : null,
        ),
      )
    }

    // ---------------------------------------------------------------- plugin
    /** Cordis SERVICE names (not package names). */
    const inject = ['slots', 'layout', 'locale']

    function apply (ctx) {
      if (ctx.locale) {
        ctx.effect(
          () => ctx.locale.register(NS, {
            zh: { panel: '鸿蒙 ArkTS', harmonyosArkts: '鸿蒙 ArkTS' },
            en: { panel: 'HarmonyOS ArkTS', harmonyosArkts: 'HarmonyOS ArkTS' },
          }),
          'dsh-harmonyos-arkts: dictionaries',
        )
      }
      const t = ctx.locale ? ctx.locale.bind(NS) : (key) => key

      // The keyed `main` body. Registering the rail icon without this throws on
      // click: layout.selectPanel: main panel "<id>" is not registered.
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, PanelPage))

      // The left-rail entry. DSH renders the button, tooltip and aria itself.
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 30,
        label: () => t('panel'),
        locale: NS,
      }, PanelIcon))
    }

    exports.apply = apply
    exports.inject = inject
    exports.PANEL_ID = PANEL_ID

    return module.exports
  },
})
