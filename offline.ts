
export const OFFLINE_QUEUE_KEY = 'sp_offline_queue_v1'

export function pushOfflineOrder(order:any){
  const q = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY)||'[]')
  q.push(order)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q))
}

export function getOfflineQueue(){
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY)||'[]')
}

export function clearOfflineQueue(){
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}
