/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const homeController = {
  handler: async (request, h) => {
    request.logger.info('Home page requested')
    const cache = request.server.storer
    try {
      if (await cache.isReady()) {
        request.logger.info('Cache is ready')
      } else {
        throw new Error('Cache is not ready')
      }
    } catch (err) {
      request.logger.error('Cache blows up', err)
      throw err
    }
    let homeTime
    try {
      homeTime = await cache.get('home-times')
      request.logger.info('Cache retrieved: ' + homeTime)
    } catch (err) {
      request.logger.error('Error retrieving cache', err)
      throw err
    }
    let allTimes
    try {
      allTimes = homeTime ? JSON.parse(JSON.parse(homeTime).timestamps) : []
      request.logger.info(`Existing Home times: ${allTimes}`)
    } catch (err) {
      request.logger.error('Error parsing cache', err)
      allTimes = []
    }
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
