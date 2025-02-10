/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const homeController = {
  handler(request, h) {
    request.logger.info('Home page requested')
    const homeTime = request.yar.get('home-time') ?? 'No home time set'
    request.logger.info(`Existing Home time: ${homeTime}`)
    request.yar.set('home-time', new Date().toISOString())
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home'
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
