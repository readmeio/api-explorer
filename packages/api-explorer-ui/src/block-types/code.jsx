const BlockCode = ({data, opts}) => {
  if (!data || !data.codes || data.codes.length === 0 || data.codes[0].code === '' || data.codes[0].code ==='{}') {
    return (
      opts = opts || {};

      if (opts.label) {
        return (
          <label>
            {opts.label}
          </label>
        )
      }
      <div className>

      </div>
    )
  }
}
