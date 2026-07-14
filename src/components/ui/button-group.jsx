import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("inline-flex rounded-md shadow-sm", className)}
    {...props}
  />
))
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
