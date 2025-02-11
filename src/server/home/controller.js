/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const homeController = {
  handler: async (request, h) => {
    request.logger.info('Home page requested')
    const cache = request.server.storer
    await cache.isReady()
    const homeTime = await cache.get('home-times')
    const allTimes = homeTime ? JSON.parse(JSON.parse(homeTime).timestamps) : []
    request.logger.info(`Existing Home times: ${homeTime}`)
    allTimes.push(new Date().toISOString())
    await cache.set(
      'home-times',
      JSON.stringify({ timestamps: JSON.stringify(allTimes) })
    )

    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home'
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
