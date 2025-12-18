import React, { useState, useMemo } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

/**
 * Convierte una imagen base64 o URL a un formato válido para el atributo src
 * Si la imagen es una URL (http/https), la retorna tal cual
 * Si es base64 sin prefijo, agrega el prefijo data:image
 */
function normalizeImageSrc(src: string | undefined): string {
  if (!src) return ERROR_IMG_SRC;

  // Si es una URL completa (http o https), retornarla tal cual
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Si ya tiene el prefijo data:image, retornarla tal cual
  if (src.startsWith('data:image/')) {
    return src;
  }

  // Si parece ser base64 puro (sin prefijo), agregarle el prefijo
  // Asumimos que es JPEG por defecto, pero podría ser PNG
  if (src.length > 100 && !src.includes('/') && !src.includes('http')) {
    return `data:image/jpeg;base64,${src}`;
  }

  // Si no coincide con ninguno de los casos anteriores, retornar como está
  return src;
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  // Normalizar la URL de la imagen (memoizado para evitar recalcular en cada render)
  const normalizedSrc = useMemo(() => normalizeImageSrc(src), [src])

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={normalizedSrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
