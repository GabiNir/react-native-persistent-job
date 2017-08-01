import withBackoff from '../../../src/streamModifiers/retryStream/withBackoff'
import {Subject} from 'rxjs'

const sleep = time => new Promise(res => setTimeout(() => res(), time))

describe('Jobs run only when the device is online', () => {
	it('When online runs, when ofline doesnt', async () => {
		const stream = new Subject()
		const spy = jest.fn()
		
		withBackoff.exponential(10, 50)(stream.asObservable()).subscribe(spy)
		
		stream.next({}) // 10 sec delay
		await sleep(5)
		expect(spy.mock.calls.length).toBe(0)
		await sleep(6)
		expect(spy.mock.calls.length).toBe(1)
		stream.next({retryNumber: 1}) // 20 sec delay
		await sleep(11)
		expect(spy.mock.calls.length).toBe(1)
		await sleep(10)
		expect(spy.mock.calls.length).toBe(2)
		stream.next({retryNumber: 3}) // 50 sec delay
		await sleep(45)
		expect(spy.mock.calls.length).toBe(2)
		await sleep(6)
		expect(spy.mock.calls.length).toBe(3)
	})
})