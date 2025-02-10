/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const homeController = {
  handler: async (request, h) => {
    request.logger.info('Home page requested')
    //  const cache = request.server.cache({
    //    segment: 'countries',
    //    expiresIn: 60 * 60 * 1000
    //  })
    const cache = request.server.storer
    //  const homeTime = request.yar.get('home-times') ?? '[]'
    const awaited = await cache.isReady()
    const homeTime = (await cache.get('home-times')) ?? '[]'
    const allTimes = JSON.parse(homeTime)
    request.logger.info(`Existing Home times: ${homeTime}`)
    allTimes.push(new Date().toISOString())
    //  request.yar.set('home-times', JSON.stringify(allTimes))
    await cache.set('home-times', JSON.stringify(allTimes), 60000)

    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home'
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
