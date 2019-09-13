import SlateConvert from 'slate-auto-replace';

export default (...args) => [...args].map(([match, trigger, type, fn]) => SlateConvert({
  trigger,
  before: typeof match === 'string' ? new RegExp(`^(${match})$`) : match,
  change: typeof fn === 'function' ? fn : (change, e, matches) => change.setBlocks({ type }),
}));