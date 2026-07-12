import * as React from "react"
import { ArrowDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Implementación propia equivalente a @shadcn/react/message-scroller.
 * Ese paquete requiere React 19 (este proyecto usa React 18), así que
 * replicamos la misma API (mismos nombres exportados) con React plano:
 * auto-scroll al fondo cuando llega contenido nuevo y el usuario ya
 * estaba ahí, más un botón para saltar al inicio/final.
 */

interface ScrollerState {
  viewportRef: React.RefObject<HTMLDivElement>
  contentRef: React.RefObject<HTMLDivElement>
  atBottom: boolean
  atTop: boolean
  scrollToEnd: (smooth?: boolean) => void
  scrollToStart: (smooth?: boolean) => void
  handleScroll: () => void
}

const ScrollerContext = React.createContext<ScrollerState | null>(null)

function useScroller() {
  const ctx = React.useContext(ScrollerContext)
  if (!ctx) {
    throw new Error(
      "Los componentes MessageScroller.* deben usarse dentro de <MessageScroller>"
    )
  }
  return ctx
}

function useMessageScroller() {
  return useScroller()
}

function useMessageScrollerScrollable() {
  const { viewportRef } = useScroller()
  const el = viewportRef.current
  return !!el && el.scrollHeight > el.clientHeight
}

function useMessageScrollerVisibility() {
  const { atTop, atBottom } = useScroller()
  return { atTop, atBottom }
}

/** Compat de API — este wrapper no necesita contexto propio de React. */
function MessageScrollerProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function MessageScroller({ className, children, ...props }: React.ComponentProps<"div">) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = React.useState(true)
  const [atTop, setAtTop] = React.useState(true)
  const atBottomRef = React.useRef(true)

  const THRESHOLD = 48

  const handleScroll = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD
    setAtBottom(bottom)
    setAtTop(el.scrollTop < THRESHOLD)
    atBottomRef.current = bottom
  }, [])

  const scrollToEnd = React.useCallback((smooth = true) => {
    const el = viewportRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" })
  }, [])

  const scrollToStart = React.useCallback((smooth = true) => {
    viewportRef.current?.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" })
  }, [])

  // Auto-scroll al fondo cuando llega contenido nuevo y el usuario ya estaba ahí.
  React.useEffect(() => {
    const content = contentRef.current
    if (!content || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      if (atBottomRef.current) scrollToEnd(false)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [scrollToEnd])

  return (
    <ScrollerContext.Provider
      value={{ viewportRef, contentRef, atBottom, atTop, scrollToEnd, scrollToStart, handleScroll }}
    >
      <div
        data-slot="message-scroller"
        className={cn(
          "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ScrollerContext.Provider>
  )
}

function MessageScrollerViewport({
  className,
  onScroll,
  ...props
}: React.ComponentProps<"div">) {
  const { viewportRef, handleScroll } = useScroller()
  return (
    <div
      ref={viewportRef}
      data-slot="message-scroller-viewport"
      onScroll={(e) => {
        handleScroll()
        onScroll?.(e)
      }}
      className={cn(
        "size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<"div">) {
  const { contentRef } = useScroller()
  return (
    <div
      ref={contentRef}
      data-slot="message-scroller-content"
      className={cn("flex h-max min-h-full flex-col gap-6", className)}
      {...props}
    />
  )
}

function MessageScrollerItem({
  className,
  scrollAnchor: _scrollAnchor = false,
  ...props
}: React.ComponentProps<"div"> & { scrollAnchor?: boolean }) {
  return (
    <div
      data-slot="message-scroller-item"
      className={cn("min-w-0 shrink-0", className)}
      {...props}
    />
  )
}

function MessageScrollerButton({
  direction = "end",
  className,
  children,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button> & { direction?: "start" | "end" }) {
  const { atBottom, atTop, scrollToEnd, scrollToStart } = useScroller()
  const active = direction === "end" ? !atBottom : !atTop

  return (
    <Button
      variant={variant}
      size={size}
      data-slot="message-scroller-button"
      data-direction={direction}
      data-active={active}
      onClick={() => (direction === "end" ? scrollToEnd() : scrollToStart())}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 border-border bg-background text-foreground shadow-md transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground",
        "data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-300",
        "data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100",
        direction === "end"
          ? "bottom-4 data-[active=false]:translate-y-full"
          : "top-4 data-[active=false]:-translate-y-full [&_svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">
            {direction === "end" ? "Ir al final" : "Ir al inicio"}
          </span>
        </>
      )}
    </Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
}
