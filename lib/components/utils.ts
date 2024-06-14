export function getLabelClipPathTextFieldOutlined(
    container: HTMLDivElement,
    label: HTMLLabelElement,
) {
    const containerRect = container.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const focusIndicatorThickness = window.getComputedStyle(container).getPropertyValue("--focus-indicator-thickness");
    const containerWidth = container.offsetWidth;  
    const containerHeight = container.offsetHeight; 
    const labelWidth = label.offsetWidth;
    const labelLeftRelativeToContainer = labelRect.left - containerRect.left;
    const labelBottomRelativeToContainer = labelRect.bottom - containerRect.top;
    
    return `polygon(
        -${focusIndicatorThickness} -${focusIndicatorThickness}, 
        ${labelLeftRelativeToContainer}px -${focusIndicatorThickness}, 
        ${labelLeftRelativeToContainer}px ${labelBottomRelativeToContainer}px, 
        ${labelLeftRelativeToContainer + labelWidth}px ${labelBottomRelativeToContainer}px, 
        ${labelLeftRelativeToContainer + labelWidth}px -${focusIndicatorThickness}, 
        calc(${containerWidth}px + ${focusIndicatorThickness}) -${focusIndicatorThickness}, 
        calc(${containerWidth}px + ${focusIndicatorThickness}) calc(${containerHeight}px + ${focusIndicatorThickness}), 
        -${focusIndicatorThickness} calc(${containerHeight}px + ${focusIndicatorThickness}), 
        -${focusIndicatorThickness} -${focusIndicatorThickness}
    )`;
}