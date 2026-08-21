import * as React from "react"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE_URL = "/favicon.png"

const Image = React.forwardRef(
  (
    {
      src,
      alt = "",
      className,
      fittingType = "fill",
      onError,
      ...props
    },
    ref
  ) => {
    const [imageSrc, setImageSrc] = React.useState(src || FALLBACK_IMAGE_URL)

    React.useEffect(() => {
      setImageSrc(src || FALLBACK_IMAGE_URL)
    }, [src])

    const handleError = (event) => {
      if (imageSrc !== FALLBACK_IMAGE_URL) {
        setImageSrc(FALLBACK_IMAGE_URL)
      }

      onError?.(event)
    }

    return (
      <img
        ref={ref}
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full",
          fittingType === "fit"
            ? "object-contain"
            : "object-cover",
          className
        )}
        onError={handleError}
        {...props}
      />
    )
  }
)

Image.displayName = "Image"

export { Image }