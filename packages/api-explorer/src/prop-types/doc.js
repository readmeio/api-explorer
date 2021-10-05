import PropTypes from 'prop-types';

export default {
  title: PropTypes.string.isRequired,
  excerpt: PropTypes.string,
  slug: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  api: PropTypes.shape({
    method: PropTypes.string.isRequired,
    examples: PropTypes.shape({
      codes: PropTypes.arrayOf(
        PropTypes.shape({
          language: PropTypes.string.isRequired,
          code: PropTypes.string.isRequired,
        }),
      ),
    }),
    results: PropTypes.shape({
      codes: PropTypes.arrayOf(
        PropTypes.shape({})
      ),
    }),
  }).isRequired,
  swagger: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
}
