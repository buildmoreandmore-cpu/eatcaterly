'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChefHat,
  DollarSign
} from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category?: string
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

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    menuItems: [{ name: '', description: '', price: '', category: '' }]
  })

  useEffect(() => {
    fetchMenus()
    setSelectedDate(new Date().toISOString().split('T')[0])
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus')
      if (response.ok) {
        const data = await response.json()
        setMenus(data)
      } else {
        // Demo data if API fails
        setMenus([
          {
            id: 'demo-1',
            title: "Monday's Fresh Menu",
            date: '2025-09-29',
            isActive: true,
            createdAt: new Date().toISOString(),
            menuItems: [
              {
                id: 'item-1',
                name: 'Grilled Chicken Sandwich',
                description: 'Juicy grilled chicken with fresh vegetables',
                price: 1200,
                category: 'Main',
                isAvailable: true
              },
              {
                id: 'item-2',
                name: 'Caesar Salad',
                description: 'Fresh romaine lettuce with parmesan',
                price: 950,
                category: 'Salad',
                isAvailable: true
              }
            ]
          },
          {
            id: 'demo-2',
            title: "Tuesday's Special",
            date: '2025-09-30',
            isActive: false,
            createdAt: new Date().toISOString(),
            menuItems: [
              {
                id: 'item-3',
                name: 'Fish Tacos',
                description: 'Fresh fish with cilantro lime sauce',
                price: 1350,
                category: 'Main',
                isAvailable: true
              }
            ]
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMenu = async () => {
    try {
      const menuData = {
        title: formData.title,
        date: formData.date,
        menuItems: formData.menuItems
          .filter(item => item.name.trim())
          .map(item => ({
            name: item.name.trim(),
            description: item.description.trim() || undefined,
            price: Math.round(parseFloat(item.price) * 100), // Convert to cents
            category: item.category.trim() || undefined,
            isAvailable: true
          }))
      }

      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData)
      })

      if (response.ok) {
        const newMenu = await response.json()
        setMenus([newMenu, ...menus])
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create menu:', error)
      // For demo mode, add locally
      const newMenu: Menu = {
        id: `demo-new-${Date.now()}`,
        title: formData.title,
        date: formData.date,
        isActive: true,
        createdAt: new Date().toISOString(),
        menuItems: formData.menuItems
          .filter(item => item.name.trim())
          .map((item, index) => ({
            id: `item-new-${index}`,
            name: item.name.trim(),
            description: item.description.trim() || undefined,
            price: Math.round(parseFloat(item.price) * 100),
            category: item.category.trim() || undefined,
            isAvailable: true
          }))
      }
      setMenus([newMenu, ...menus])
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      menuItems: [{ name: '', description: '', price: '', category: '' }]
    })
    setShowCreateForm(false)
  }

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menuItems: [...formData.menuItems, { name: '', description: '', price: '', category: '' }]
    })
  }

  const removeMenuItem = (index: number) => {
    setFormData({
      ...formData,
      menuItems: formData.menuItems.filter((_, i) => i !== index)
    })
  }

  const updateMenuItem = (index: number, field: string, value: string) => {
    const updatedItems = formData.menuItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setFormData({ ...formData, menuItems: updatedItems })
  }

  const toggleMenuStatus = async (menuId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setMenus(menus.map(menu =>
          menu.id === menuId ? { ...menu, isActive: !isActive } : menu
        ))
      }
    } catch (error) {
      console.error('Failed to toggle menu status:', error)
      // For demo mode, update locally
      setMenus(menus.map(menu =>
        menu.id === menuId ? { ...menu, isActive: !isActive } : menu
      ))
    }
  }

  const deleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMenus(menus.filter(menu => menu.id !== menuId))
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
      // For demo mode, delete locally
      setMenus(menus.filter(menu => menu.id !== menuId))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Menu Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage daily menus with calendar planning
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Menu
          </Button>
        </div>
      </div>

      {/* Quick Date Navigation */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <label className="block text-sm font-medium text-gray-700">
            Jump to Date:
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button
            variant="outline"
            onClick={() => setSelectedDate(getTodaysDate())}
          >
            Today
          </Button>
        </div>
        {selectedDate && (
          <p className="mt-2 text-sm text-gray-600">
            Viewing menus for: {formatDate(selectedDate)}
          </p>
        )}
      </div>

      {/* Create Menu Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Create New Menu</h3>
            <Button variant="ghost" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Title *
                </label>
                <Input
                  placeholder="e.g., Monday's Fresh Menu"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Menu Items</h4>
                <Button type="button" onClick={addMenuItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {formData.menuItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name *
                        </label>
                        <Input
                          placeholder="e.g., Grilled Chicken"
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <Input
                          placeholder="Brief description"
                          value={item.description}
                          onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price ($) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="12.99"
                          value={item.price}
                          onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="e.g., Main, Dessert"
                            value={item.category}
                            onChange={(e) => updateMenuItem(index, 'category', e.target.value)}
                          />
                          {formData.menuItems.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMenuItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleCreateMenu}>
                <Check className="mr-2 h-4 w-4" />
                Create Menu
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChefHat className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Menus
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {menus.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Menus
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {menus.filter(m => m.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {menus.reduce((total, menu) => total + menu.menuItems.length, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menus List */}
      <div className="space-y-4">
        {menus
          .filter(menu => !selectedDate || menu.date === selectedDate)
          .map((menu) => (
            <div key={menu.id} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{menu.title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(menu.date)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleMenuStatus(menu.id, menu.isActive)}
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        menu.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {menu.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMenu(menu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {menu.menuItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                          {item.category && (
                            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-2">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-gray-900">
                            ${(item.price / 100).toFixed(2)}
                          </p>
                          <p className={`text-xs ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

        {menus.filter(menu => !selectedDate || menu.date === selectedDate).length === 0 && (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No menus found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {selectedDate
                ? `No menus created for ${formatDate(selectedDate)}`
                : 'No menus have been created yet'
              }
            </p>
            <div className="mt-4">
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Menu
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}