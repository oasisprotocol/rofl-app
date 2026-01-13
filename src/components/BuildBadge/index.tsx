// Export a helper function to get hostname for testability
// eslint-disable-next-line react-refresh/only-export-components
export const getHostname = () => window.location.hostname

export const BuildBadge = () => {
  const hostname = getHostname()

  let label = ''

  if (hostname === 'dev.rofl.app') {
    label = 'DEV'
  } else if (hostname === 'stg.rofl.app') {
    label = 'STG'
  } else if (hostname.endsWith('.rofl-app.pages.dev')) {
    label = hostname.split('.rofl-app.pages.dev')[0]
  }

  if (!label) {
    return null
  }

  return (
    <div className="h-[14px] py-2 px-1.5 bg-warning rounded-full inline-flex justify-center items-center">
      <div className="text-white text-[10px] font-semibold uppercase">{label}</div>
    </div>
  )
}
