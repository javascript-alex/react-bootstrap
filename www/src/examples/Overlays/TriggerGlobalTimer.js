<ButtonGroup>
  {['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4'].map((text, idx) => (
    <OverlayTrigger
      key="text"
      placement="top"
      delay={500}
      globalDelay
      overlay={<Tooltip id={`button-tooltip-${text}`}>{text}</Tooltip>}
    >
      <Button variant="secondary">{idx + 1}</Button>
    </OverlayTrigger>
  ))}
</ButtonGroup>;
