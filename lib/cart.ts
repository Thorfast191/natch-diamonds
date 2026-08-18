export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

export type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'quantity'>; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'updateQuantity'; productId: string; quantity: number }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] }

export const MAX_QUANTITY = 20
const MIN_QUANTITY = 1

export function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(quantity)))
}

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const quantity = clampQuantity(action.quantity)
      const existing = state.find((i) => i.productId === action.item.productId)
      if (existing) {
        return state.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: clampQuantity(i.quantity + quantity) }
            : i
        )
      }
      return [...state, { ...action.item, quantity }]
    }
    case 'remove':
      return state.filter((i) => i.productId !== action.productId)
    case 'updateQuantity':
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: clampQuantity(action.quantity) } : i
      )
    case 'clear':
      return []
    case 'hydrate':
      return action.items
    default:
      return state
  }
}

export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}
