const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');

function Doc({ doc }) {
  return (
    <li className="hub-sidebar-page subnav-expanded">
      <a className="text-overflow" href={`#${doc.slug}`}>
        <span className={`pg-type type-${doc.api.method}`}>{doc.api.method}</span>
        {doc.title}
      </a>
    </li>
  );
}

Doc.propTypes = {
  doc: PropTypes.shape({
    api: PropTypes.shape({
      method: PropTypes.string.isRequired,
    }),
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

function Sidebar({ title, docs }) {
  return ReactDOM.createPortal(
    <div className="hub-sidebar-category">
      <h3>{title}</h3>
      <ul>
        {docs.map(doc => (
          <Doc key={doc._id} doc={doc} />
        ))}
      </ul>
    </div>,
    document.getElementById('hub-sidebar-content'),
  );
}

Sidebar.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
};

module.exports = Sidebar;
