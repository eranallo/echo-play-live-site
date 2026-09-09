export default function BrandLogo({ variant = 'white', size = 72, className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={`/brand/epl-seal-${variant}.svg`}
      width={size}
      height={size}
      alt="Echo Play Live — Established 2023"
    />
  )
}
