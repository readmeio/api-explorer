import React from 'react';
import IconButton from './IconButton';

export default function AddButton({ className, onClick, disabled }) {
  return (
    <div className="row">
      <p className={`col-xs-3 col-xs-offset-9 text-right ${className}`}>
        <IconButton
          className="btn-add col-xs-12"
          disabled={disabled}
          icon="plus"
          onClick={onClick}
          tabIndex="0"
          type="info"
        />
      </p>
    </div>
  );
}
