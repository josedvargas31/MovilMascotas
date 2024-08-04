import React from 'react';
// import './ButtonAtom.css'; // Import the CSS file

const Botones = ({ onClick, actionLabel, variant }) => {
    return (
        <button className="button-atom" onClick={onClick}>
          {actionLabel}
        </button>
      );
      
};

export default Botones;
