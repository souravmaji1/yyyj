"use client";
import React from "react";

type Props = React.HTMLAttributes<HTMLElement> & { as?: any };

export default function Glass({ as: Tag = "div", className = "", children, ...rest }: Props) {
  return (
    <Tag className={`glass ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}