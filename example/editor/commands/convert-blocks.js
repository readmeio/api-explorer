/**
 @todo
  [ ] turn this in to an actual Slate command or move it.
 */
import SlateConvert from 'slate-auto-replace';

export default (...args) => [...args].map(([match, trigger, type]) => SlateConvert({
  trigger,
  before: typeof match === 'string' ? new RegExp(`^(${match})$`) : match,
  change: typeof type === 'function' ? type : (change, e, matches) => change.setBlocks({ type }),
}));