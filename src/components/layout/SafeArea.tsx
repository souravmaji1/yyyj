import { ReactNode, ElementType } from "react";

interface SafeAreaProps {
  as?: ElementType;
  children: ReactNode;
}

export function SafeArea({ as: Component = "div", children }: SafeAreaProps) {
  const StyledComponent = Component as any;
  return (
    <StyledComponent
      id={Component === "main" ? "main-content" : undefined}
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      {children}
    </StyledComponent>
  );
}
