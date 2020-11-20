import React from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';
import updateInputWidth, { getFontShorthand } from 'update-input-width';
import predictInputValue from '@wojtekmaj/predict-input-value';

/* eslint-disable jsx-a11y/no-autofocus */

function onFocus(event) {
  const { target } = event;

  requestAnimationFrame(() => target.select());
}

function updateInputWidthOnFontLoad(element) {
  if (!document.fonts) {
    return;
  }

  const font = getFontShorthand(element);

  if (!font) {
    return;
  }

  const isFontLoaded = document.fonts.check(font);

  if (isFontLoaded) {
    return;
  }

  function onLoadingDone() {
    updateInputWidth(element);
  }

  document.fonts.addEventListener('loadingdone', onLoadingDone);
}

function addLeadingZero(value, max) {
  `0${value}`.slice(-(`${max}`.length));
}

function makeOnKeyDown({ max, min, showLeadingZeros }) {
  return function onKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();

        const { target: input } = event;
        const { value } = input;

        const rawNextValue = Number(value) + (event.key === 'ArrowUp' ? 1 : -1);

        if (rawNextValue < min || rawNextValue > max) {
          return;
        }

        const hasLeadingZero = showLeadingZeros && rawNextValue < 10;
        const nextValue = hasLeadingZero ? addLeadingZero(rawNextValue, max) : rawNextValue;

        input.value = nextValue;

        break;
      }
      default:
    }
  };
}

function makeOnKeyPress(max) {
  return function onKeyPress(event) {
    const { key } = event;

    const isNumberKey = !isNaN(parseInt(key, 10));
    const nextValue = predictInputValue(event);

    if (isNumberKey && (nextValue <= max)) {
      return;
    }

    event.preventDefault();
  };
}

export default function Input({
  ariaLabel,
  autoFocus,
  className,
  disabled,
  itemRef,
  max,
  min,
  name,
  nameForClass,
  onChange,
  onKeyDown,
  onKeyUp,
  placeholder = '--',
  required,
  showLeadingZeros,
  step,
  value,
}) {
  const hasLeadingZero = showLeadingZeros && value !== null && value < 10;

  const onKeyDownInternal = makeOnKeyDown({ max, min, showLeadingZeros });
  const onKeyPressInternal = makeOnKeyPress({ max });

  return [
    (hasLeadingZero && <span key="leadingZero" className={`${className}__leadingZero`}>0</span>),
    <input
      key="input"
      aria-label={ariaLabel}
      autoComplete="off"
      autoFocus={autoFocus}
      className={mergeClassNames(
        `${className}__input`,
        `${className}__${nameForClass || name}`,
        hasLeadingZero && `${className}__input--hasLeadingZero`,
      )}
      data-input="true"
      disabled={disabled}
      inputMode="numeric"
      max={max}
      min={min}
      name={name}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={(event) => {
        onKeyDownInternal(event);

        if (onKeyDown) {
          onKeyDown(event);
        }
      }}
      onKeyPress={onKeyPressInternal}
      onKeyUp={(event) => {
        updateInputWidth(event.target);

        if (onKeyUp) {
          onKeyUp(event);
        }
      }}
      placeholder={placeholder}
      ref={(ref) => {
        if (ref) {
          updateInputWidth(ref);
          updateInputWidthOnFontLoad(ref);
        }

        if (itemRef) {
          itemRef(ref, name);
        }
      }}
      required={required}
      step={step}
      type="text"
      value={value !== null ? value : ''}
    />,
  ];
}

Input.propTypes = {
  ariaLabel: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  itemRef: PropTypes.func,
  max: PropTypes.number,
  min: PropTypes.number,
  name: PropTypes.string,
  nameForClass: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  showLeadingZeros: PropTypes.bool,
  step: PropTypes.number,
  value: PropTypes.number,
};
