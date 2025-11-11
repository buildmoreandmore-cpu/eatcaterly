'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, DollarSign, Check, X } from 'lucide-react'

interface MenuItem {
  id?: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

interface Menu {
  id: string
  title: string
  date: string
  isActive: boolean
  menuItems: MenuItem[]
  createdAt: string
}

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [currentItem, setCurrentItem] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    isAvailable: true
  })

  useEffect(() => {
    // Check if in demo mode
    const urlParams = new URLSearchParams(window.location.search)
    const demoMode = urlParams.get('demo') === 'true' || localStorage.getItem('authMode') === 'demo'
    setIsDemoMode(demoMode)

    if (demoMode) {
      loadDemoMenus()
    } else {
      loadMenus()
    }
  }, [])

  function loadDemoMenus() {
    // Demo data
    const demoMenus: Menu[] = [
      {
        id: 'demo-1',
        title: "Chef Maria's Friday Special",
        date: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        menuItems: [
          { name: 'Grilled Salmon', description: 'With lemon herbs and roasted vegetables', price: 2400, category: 'main', isAvailable: true },
          { name: 'Pasta Primavera', description: 'Fresh seasonal vegetables in garlic sauce', price: 1800, category: 'main', isAvailable: true },
          { name: 'Caesar Salad', description: 'Crispy romaine with house-made dressing', price: 1200, category: 'appetizer', isAvailable: true },
          { name: 'Tiramisu', description: 'Classic Italian dessert', price: 800, category: 'dessert', isAvailable: true },
        ]
      },
      {
        id: 'demo-2',
        title: "Today's Fresh Selections",
        date: new Date(Date.now() - 86400000).toISOString(),
        isActive: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        menuItems: [
          { name: 'BBQ Chicken', description: 'Slow-cooked with signature sauce', price: 1600, category: 'main', isAvailable: true },
          { name: 'Greek Salad', description: 'Feta, olives, and fresh vegetables', price: 1000, category: 'appetizer', isAvailable: true },
          { name: 'Garlic Bread', description: 'Toasted with herb butter', price: 600, category: 'side', isAvailable: true },
        ]
      }
    ]

    setMenus(demoMenus)
    setLoading(false)
  }

  async function loadMenus() {
    try {
      setLoading(true)
      const res = await fetch('/api/menus')
      if (res.ok) {
        const data = await res.json()
        setMenus(data)
      }
    } catch (error) {
      console.error('Failed to load menus:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAddItem() {
    if (!currentItem.name || currentItem.price <= 0) {
      alert('Please enter item name and price')
      return
    }

    setMenuItems([...menuItems, { ...currentItem }])
    setCurrentItem({
      name: '',
      description: '',
      price: 0,
      category: 'main',
      isAvailable: true
    })
  }

  function handleRemoveItem(index: number) {
    setMenuItems(menuItems.filter((_, i) => i !== index))
  }

  async function handleCreateMenu() {
    console.log('Create menu clicked - State:', { title, date, menuItems })

    const missing = []
    if (!title) missing.push('title')
    if (!date) missing.push('date')
    if (menuItems.length === 0) missing.push('at least one menu item')

    if (missing.length > 0) {
      alert(`Please enter: ${missing.join(', ')}`)
      return
    }

    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, menuItems })
      })

      if (res.ok) {
        alert('Menu created successfully!')
        setShowCreateModal(false)
        resetForm()
        loadMenus()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create menu')
      }
    } catch (error) {
      alert('Failed to create menu')
    }
  }

  async function handleDeleteMenu(menuId: string) {
    if (!confirm('Are you sure you want to delete this menu?')) return

    try {
      const res = await fetch(`/api/menus/${menuId}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Menu deleted successfully')
        loadMenus()
      } else {
        alert('Failed to delete menu')
      }
    } catch (error) {
      alert('Failed to delete menu')
    }
  }

  function resetForm() {
    setTitle('')
    setDate('')
    setMenuItems([])
    setCurrentItem({
      name: '',
      description: '',
      price: 0,
      category: 'main',
      isAvailable: true
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Menu Management</h1>
        <div className="text-gray-500">Loading menus...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Create New Menu
          </button>
        </div>

        {/* Menus List */}
        {menus.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Menus Yet</h3>
            <p className="text-gray-600 mb-4">Create your first menu to start sending to customers via SMS</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Menu
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{menu.title}</h3>
                      {menu.isActive && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(menu.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete menu"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  {menu.menuItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-3 last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {item.category}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ${(item.price / 100).toFixed(2)}
                        </div>
                        {!item.isAvailable && (
                          <span className="text-xs text-red-600">Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t flex gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">{menu.menuItems.length}</span> items
                  </div>
                  <div>
                    Total: <span className="font-semibold">
                      ${(menu.menuItems.reduce((sum, item) => sum + item.price, 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Menu Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Create New Menu</h2>
                  <button
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Menu Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Tuesday Lunch Special"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Add Menu Item */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Add Menu Item</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={currentItem.name}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                        placeholder="e.g., Grilled Chicken"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price * ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentItem.price / 100}
                        onChange={(e) => setCurrentItem({ ...currentItem, price: Math.round(parseFloat(e.target.value) * 100) })}
                        placeholder="12.99"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={currentItem.description}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        placeholder="Served with rice and vegetables"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={currentItem.category}
                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="appetizer">Appetizer</option>
                        <option value="main">Main Course</option>
                        <option value="side">Side</option>
                        <option value="dessert">Dessert</option>
                        <option value="drink">Drink</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Add Item to Menu
                  </button>
                </div>

                {/* Menu Items List */}
                {menuItems.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Menu Items ({menuItems.length})</h3>
                    <div className="space-y-2">
                      {menuItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">${(item.price / 100).toFixed(2)}</span>
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 sticky bottom-0">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMenu}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Create Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
