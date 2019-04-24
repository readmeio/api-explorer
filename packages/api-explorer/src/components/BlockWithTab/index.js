import React, {Fragment} from 'react'
import PropTypes from 'prop-types'

import colors from '../../colors'

export default function BlockWithTab({items, selected, onClick, children}){
    const style = {
      selected: {
        background: colors.BlockWithTabSelected
      }
    }
    return(
      <Fragment>
        <ul className="code-sample-tabs">
          {items.map(item => {
            return(
              <li key={item.value} style={item.value === selected ? style.selected : {}}>
                {
                // eslint-disable-next-line jsx-a11y/href-no-hash
                  <a
                    href="#"
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
      </Fragment>
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
    children: PropTypes.node.isRequired
  }