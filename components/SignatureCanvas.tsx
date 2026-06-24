'use client'

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { cn } from '@/lib/utils'

export interface SignatureCanvasHandle {
  clear: () => void
  isEmpty: () => boolean
  toDataURL: (type?: string, quality?: number) => string
}

interface SignatureCanvasProps {
  className?: string
  lineWidth?: number
  strokeColor?: string
  onBegin?: () => void
  onEnd?: () => void
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  (
    {
      className,
      lineWidth = 2.5,
      strokeColor = '#1a1a1a',
      onBegin,
      onEnd,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawingRef = useRef(false)
    const lastPosRef = useRef<{ x: number; y: number } | null>(null)
    const emptyRef = useRef(true)

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      clear() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        emptyRef.current = true
      },
      isEmpty() {
        return emptyRef.current
      },
      toDataURL(type = 'image/png', quality?: number) {
        return canvasRef.current?.toDataURL(type, quality) ?? ''
      },
    }))

    // Resize canvas to fill its CSS container
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const resize = () => {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        const ctx = canvas.getContext('2d')!
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas)
      return () => ro.disconnect()
    }, [])

    const getPos = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = 'clientX' in e ? e.clientX : e.clientX
      const clientY = 'clientY' in e ? e.clientY : e.clientY
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const startDrawing = useCallback(
      (pos: { x: number; y: number }) => {
        isDrawingRef.current = true
        lastPosRef.current = pos
        if (emptyRef.current) {
          emptyRef.current = false
          onBegin?.()
        }
      },
      [onBegin]
    )

    const draw = useCallback(
      (pos: { x: number; y: number }) => {
        if (!isDrawingRef.current || !lastPosRef.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        ctx.beginPath()
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
        lastPosRef.current = pos
      },
      [lineWidth, strokeColor]
    )

    const stopDrawing = useCallback(() => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        lastPosRef.current = null
        onEnd?.()
      }
    }, [onEnd])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Mouse events
      const onMouseDown = (e: MouseEvent) => startDrawing(getPos(e, canvas))
      const onMouseMove = (e: MouseEvent) => draw(getPos(e, canvas))
      const onMouseUp = () => stopDrawing()

      // Touch events
      const onTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        startDrawing(getPos(e.touches[0], canvas))
      }
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        draw(getPos(e.touches[0], canvas))
      }
      const onTouchEnd = () => stopDrawing()

      canvas.addEventListener('mousedown', onMouseDown)
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseup', onMouseUp)
      canvas.addEventListener('mouseleave', onMouseUp)
      canvas.addEventListener('touchstart', onTouchStart, { passive: false })
      canvas.addEventListener('touchmove', onTouchMove, { passive: false })
      canvas.addEventListener('touchend', onTouchEnd)

      return () => {
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('mousemove', onMouseMove)
        canvas.removeEventListener('mouseup', onMouseUp)
        canvas.removeEventListener('mouseleave', onMouseUp)
        canvas.removeEventListener('touchstart', onTouchStart)
        canvas.removeEventListener('touchmove', onTouchMove)
        canvas.removeEventListener('touchend', onTouchEnd)
      }
    }, [startDrawing, draw, stopDrawing])

    return (
      <canvas
        ref={canvasRef}
        className={cn(
          'signature-canvas w-full h-full block bg-white rounded-lg border-2 border-dashed border-gray-300',
          className
        )}
      />
    )
  }
)

SignatureCanvas.displayName = 'SignatureCanvas'
export default SignatureCanvas
