import React, { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check, Trash2, ChevronDown, ChevronRight, ShoppingCart } from "@phosphor-icons/react"

interface GroceryItem {
  id: string
  name: string
  completed: boolean
  addedAt: number
}

function App() {
  const [currentList, setCurrentList] = useKV<GroceryItem[]>('grocery-current-list', [])
  const [pastItems, setPastItems] = useKV<GroceryItem[]>('grocery-past-items', [])
  const [newItemName, setNewItemName] = useState('')
  const [isPastItemsOpen, setIsPastItemsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addItem = () => {
    if (!newItemName.trim()) return
    
    const trimmedName = newItemName.trim()
    
    // Check if item already exists in current list
    const existsInCurrent = currentList.some(item => 
      item.name.toLowerCase() === trimmedName.toLowerCase()
    )
    
    if (existsInCurrent) {
      setNewItemName('')
      inputRef.current?.focus()
      return
    }

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: trimmedName,
      completed: false,
      addedAt: Date.now()
    }

    setCurrentList([...currentList, newItem])
    setNewItemName('')
    inputRef.current?.focus()
  }

  const toggleItemComplete = (itemId: string) => {
    const updatedList = currentList.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, completed: !item.completed }
        
        // If item is being completed, move to past items
        if (updatedItem.completed) {
          // Add to past items if not already there
          const existsInPast = pastItems.some(pastItem => 
            pastItem.name.toLowerCase() === item.name.toLowerCase()
          )
          
          if (!existsInPast) {
            setPastItems([...pastItems, { ...updatedItem, completed: false }])
          }
        }
        
        return updatedItem
      }
      return item
    })
    
    setCurrentList(updatedList)
  }

  const removeItem = (itemId: string) => {
    setCurrentList(currentList.filter(item => item.id !== itemId))
  }

  const addFromPastItems = (pastItem: GroceryItem) => {
    // Check if item already exists in current list
    const existsInCurrent = currentList.some(item => 
      item.name.toLowerCase() === pastItem.name.toLowerCase()
    )
    
    if (existsInCurrent) return

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: pastItem.name,
      completed: false,
      addedAt: Date.now()
    }

    setCurrentList([...currentList, newItem])
  }

  const clearCompletedItems = () => {
    setCurrentList(currentList.filter(item => !item.completed))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem()
    }
  }

  const activeItems = currentList.filter(item => !item.completed)
  const completedItems = currentList.filter(item => item.completed)
  const availablePastItems = pastItems.filter(pastItem => 
    !currentList.some(currentItem => 
      currentItem.name.toLowerCase() === pastItem.name.toLowerCase()
    )
  )

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="text-primary" size={28} />
            <h1 className="text-2xl font-semibold text-foreground">Grocery List</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} to buy
          </p>
        </div>

        {/* Add Item Input */}
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add grocery item..."
              className="flex-1 text-base"
            />
            <Button 
              onClick={addItem}
              disabled={!newItemName.trim()}
              size="default"
              className="px-3"
            >
              <Plus size={20} />
            </Button>
          </div>
        </Card>

        {/* Current Shopping List */}
        {currentList.length > 0 && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-foreground">Shopping List</h2>
                {completedItems.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearCompletedItems}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear completed
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {/* Active Items */}
                {activeItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItemComplete(item.id)}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-foreground font-medium">
                      {item.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}

                {/* Completed Items */}
                {completedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItemComplete(item.id)}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-muted-foreground line-through">
                      {item.name}
                    </span>
                    <Check className="text-primary" size={16} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Past Items Section */}
        {availablePastItems.length > 0 && (
          <Card className="p-4">
            <Collapsible open={isPastItemsOpen} onOpenChange={setIsPastItemsOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-0 h-auto font-medium text-foreground hover:bg-transparent"
                >
                  <span>Past Items ({availablePastItems.length})</span>
                  {isPastItemsOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Tap any item to add it back to your list
                </p>
                {availablePastItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addFromPastItems(item)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium group-hover:text-accent-foreground">
                        {item.name}
                      </span>
                      <Plus className="text-muted-foreground group-hover:text-primary transition-colors" size={16} />
                    </div>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Empty State */}
        {currentList.length === 0 && (
          <Card className="p-8 text-center">
            <ShoppingCart className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="font-medium text-foreground mb-2">Start your grocery list</h3>
            <p className="text-muted-foreground text-sm">
              Add items above to begin shopping
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App