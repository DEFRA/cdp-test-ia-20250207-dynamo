/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
export const homeController = {
  handler(request, h) {
    request.logger.info('Home page requested')
    const homeTime = request.yar.get('home-times') ?? '[]'
    const allTimes = JSON.parse(homeTime)
    request.logger.info(`Existing Home times: ${homeTime}`)
    allTimes.push(new Date().toISOString())
    request.yar.set('home-times', JSON.stringify(allTimes))
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home'
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
