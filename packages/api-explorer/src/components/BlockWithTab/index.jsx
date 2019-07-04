import React from 'react'
import PropTypes from 'prop-types'

import colors from '../../colors'

export default function BlockWithTab({
  items,
  selected,
  onClick,
  children,
  styleSelectedItem,
  styleList,
  styleLink,
  styleItem
}) {
  const style = {
    selected: {
      background: colors.blockWithTabSelected
    },
    ul: {
      padding: '0px 30px 0px 20px',
      margin: 0,
      background: colors.blockWithTabList,
      fontSize: 14,
      listStyleType: 'none'
    },
    a: {
      display: 'inline-block',
      padding: '5px 10px',
      color: colors.blockWithTabLink
    }
  }
  const styleSelected = { ...style.selected, ...styleSelectedItem }
  return (
    <div>
      <ul style={{ ...style.ul, ...styleList }}>
        {items.map(item => {
          return (
            <li key={item.value} style={{ ...styleItem, ...(item.value === selected ? styleSelected : {}), display: 'inline-block' }}>
              {
                // eslint-disable-next-line jsx-a11y/href-no-hash
                <a
                  href="#"
                  style={{ ...style.a, ...styleLink }}
                  onClick={e => {
                    e.preventDefault();
                    onClick(item.value);
                  }}
                >
                  {item.label}
                </a>
              }
            </li>
          )
        })}
      </ul>
      {children}
    </div>
  )
}
BlockWithTab.propTypes = {
  onClick: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.node
      }),
      PropTypes.shape({
        label: PropTypes.string,
        onClick: PropTypes.func
      })
    ])
  ).isRequired,
  selected: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  styleList: PropTypes.object,
  styleSelectedItem: PropTypes.object,
  styleItem: PropTypes.object,
  styleLink: PropTypes.object
}
BlockWithTab.defaultProps = {
  styleSelectedItem: {},
  styleList: {},
  styleLink: {},
  styleItem: {}
}
