import { describe, expect, it } from 'vitest'
import { cartReducer, getItemCount, getSubtotal, type CartItem } from './cart'

const stud = { productId: 'p1', name: 'Solitaire Studs', price: 128000, imageUrl: 'x' }
const hoop = { productId: 'p2', name: 'Classic Hoops', price: 154000, imageUrl: 'y' }

describe('cartReducer', () => {
  it('adds a new item', () => {
    const state = cartReducer([], { type: 'add', item: stud, quantity: 1 })
    expect(state).toEqual([{ ...stud, quantity: 1 }])
  })

  it('increases quantity when adding an item already in the cart', () => {
    const initial: CartItem[] = [{ ...stud, quantity: 2 }]
    const state = cartReducer(initial, { type: 'add', item: stud, quantity: 3 })
    expect(state).toEqual([{ ...stud, quantity: 5 }])
  })

  it('clamps quantity to a maximum of 20', () => {
    const state = cartReducer([], { type: 'add', item: stud, quantity: 50 })
    expect(state[0].quantity).toBe(20)
  })

  it('clamps quantity to a minimum of 1', () => {
    const state = cartReducer([], { type: 'add', item: stud, quantity: -3 })
    expect(state[0].quantity).toBe(1)
  })

  it('removes an item by productId', () => {
    const initial: CartItem[] = [{ ...stud, quantity: 1 }, { ...hoop, quantity: 1 }]
    const state = cartReducer(initial, { type: 'remove', productId: 'p1' })
    expect(state).toEqual([{ ...hoop, quantity: 1 }])
  })

  it('updates the quantity of an existing item', () => {
    const initial: CartItem[] = [{ ...stud, quantity: 1 }]
    const state = cartReducer(initial, { type: 'updateQuantity', productId: 'p1', quantity: 7 })
    expect(state[0].quantity).toBe(7)
  })

  it('clears the cart', () => {
    const initial: CartItem[] = [{ ...stud, quantity: 1 }]
    expect(cartReducer(initial, { type: 'clear' })).toEqual([])
  })

  it('replaces state on hydrate', () => {
    const stored: CartItem[] = [{ ...hoop, quantity: 4 }]
    expect(cartReducer([], { type: 'hydrate', items: stored })).toEqual(stored)
  })
})

describe('getSubtotal', () => {
  it('sums price times quantity across items', () => {
    const items: CartItem[] = [{ ...stud, quantity: 2 }, { ...hoop, quantity: 1 }]
    expect(getSubtotal(items)).toBe(128000 * 2 + 154000)
  })

  it('returns 0 for an empty cart', () => {
    expect(getSubtotal([])).toBe(0)
  })
})

describe('getItemCount', () => {
  it('sums quantities across items', () => {
    const items: CartItem[] = [{ ...stud, quantity: 2 }, { ...hoop, quantity: 3 }]
    expect(getItemCount(items)).toBe(5)
  })
})
