import React, { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check, Trash2, ChevronDown, ChevronRight, ShoppingCart, Package } from "@phosphor-icons/react"

interface GroceryItem {
  id: string
  name: string
  completed: boolean
  addedAt: number
  category: string
}

// Grocery item categories with common items
const CATEGORIES = {
  'Produce': ['apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'peach', 'pear', 'plum', 'cherry', 'mango', 'pineapple', 'watermelon', 'cantaloupe', 'honeydew', 'avocado', 'tomato', 'cucumber', 'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower', 'carrot', 'celery', 'onion', 'garlic', 'potato', 'sweet potato', 'bell pepper', 'jalapeño', 'mushroom', 'zucchini', 'squash', 'eggplant', 'asparagus', 'green bean', 'pea', 'corn', 'radish', 'turnip', 'beet', 'parsnip', 'leek', 'scallion', 'chive', 'herb', 'basil', 'cilantro', 'parsley', 'mint', 'rosemary', 'thyme'],
  'Dairy & Eggs': ['milk', 'cheese', 'butter', 'yogurt', 'egg', 'cream', 'sour cream', 'cottage cheese', 'cream cheese', 'mozzarella', 'cheddar', 'parmesan', 'swiss', 'feta', 'goat cheese', 'ricotta', 'brie', 'camembert', 'blue cheese', 'half and half', 'heavy cream', 'whipped cream', 'condensed milk', 'evaporated milk', 'almond milk', 'soy milk', 'oat milk', 'coconut milk'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'crab', 'lobster', 'scallop', 'mussel', 'clam', 'oyster', 'ground beef', 'ground turkey', 'ground chicken', 'steak', 'roast', 'chop', 'bacon', 'sausage', 'ham', 'deli meat', 'hot dog', 'bratwurst'],
  'Pantry & Dry Goods': ['rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'cereal', 'oats', 'quinoa', 'lentil', 'bean', 'chickpea', 'nut', 'peanut', 'almond', 'walnut', 'cashew', 'pistachio', 'seed', 'sunflower seed', 'pumpkin seed', 'chia seed', 'flax seed', 'honey', 'maple syrup', 'vanilla', 'baking powder', 'baking soda', 'spice', 'seasoning', 'sauce', 'condiment', 'ketchup', 'mustard', 'mayo', 'bbq sauce', 'soy sauce', 'worcestershire', 'hot sauce'],
  'Frozen': ['frozen vegetable', 'frozen fruit', 'frozen meal', 'ice cream', 'frozen pizza', 'frozen chicken', 'frozen fish', 'frozen shrimp', 'frozen berry', 'frozen corn', 'frozen pea', 'frozen broccoli', 'frozen spinach', 'frozen potato', 'french fry', 'tater tot', 'frozen waffle', 'frozen bagel', 'frozen bread', 'frozen yogurt', 'sorbet', 'popsicle'],
  'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine', 'energy drink', 'sports drink', 'coconut water', 'sparkling water', 'kombucha', 'smoothie', 'protein shake', 'orange juice', 'apple juice', 'cranberry juice', 'grape juice', 'lemonade', 'iced tea'],
  'Personal Care': ['shampoo', 'conditioner', 'soap', 'toothpaste', 'toothbrush', 'deodorant', 'lotion', 'sunscreen', 'razor', 'shaving cream', 'mouthwash', 'floss', 'tissue', 'toilet paper', 'feminine product', 'baby diaper', 'baby wipe', 'hand sanitizer', 'face wash', 'moisturizer'],
  'Household': ['detergent', 'fabric softener', 'bleach', 'dish soap', 'sponge', 'paper towel', 'aluminum foil', 'plastic wrap', 'trash bag', 'cleaning spray', 'disinfectant', 'air freshener', 'candle', 'light bulb', 'battery', 'tape', 'glue', 'marker', 'pen', 'notebook'],
  'Snacks': ['chip', 'cracker', 'cookie', 'candy', 'chocolate', 'gum', 'mint', 'granola bar', 'protein bar', 'trail mix', 'popcorn', 'pretzel', 'jerky', 'dried fruit', 'fruit snack', 'cheese stick', 'yogurt cup']
}

const categorizeItem = (itemName: string): string => {
  const lowerName = itemName.toLowerCase()
  
  for (const [category, items] of Object.entries(CATEGORIES)) {
    if (items.some(item => lowerName.includes(item) || item.includes(lowerName))) {
      return category
    }
  }
  
  return 'Other'
}

function App() {
  const [currentList, setCurrentList] = useKV<GroceryItem[]>('grocery-current-list', [])
  const [pastItems, setPastItems] = useKV<GroceryItem[]>('grocery-past-items', [])
  const [newItemName, setNewItemName] = useState('')
  const [isPastItemsOpen, setIsPastItemsOpen] = useState(false)
  const [isCompletedOpen, setIsCompletedOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Migrate existing items to include categories
  useEffect(() => {
    const migrateItems = (items: GroceryItem[]) => {
      return items.map(item => ({
        ...item,
        category: item.category || categorizeItem(item.name)
      }))
    }

    if (currentList.some(item => !item.category)) {
      setCurrentList(migrateItems(currentList))
    }
    if (pastItems.some(item => !item.category)) {
      setPastItems(migrateItems(pastItems))
    }
  }, [currentList, pastItems, setCurrentList, setPastItems])

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
      addedAt: Date.now(),
      category: categorizeItem(trimmedName)
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
            setPastItems([...pastItems, { ...updatedItem, completed: false, category: categorizeItem(item.name) }])
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
      addedAt: Date.now(),
      category: pastItem.category || categorizeItem(pastItem.name)
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

  // Group active items by category
  const groupedActiveItems = activeItems.reduce((groups: Record<string, GroceryItem[]>, item) => {
    const category = item.category || 'Other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {})

  // Sort categories by a logical shopping order
  const categoryOrder = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Dry Goods', 'Frozen', 'Beverages', 'Personal Care', 'Household', 'Snacks', 'Other']
  const sortedCategories = categoryOrder.filter(category => groupedActiveItems[category]?.length > 0)

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
            <div className="space-y-4">
              <h2 className="font-medium text-foreground">Shopping List</h2>
              
              {/* Active Items by Category */}
              {sortedCategories.map((category) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 mt-4 first:mt-0">
                    <Package className="text-primary" size={16} />
                    <h3 className="font-medium text-sm text-primary uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  
                  <div className="space-y-1">
                    {groupedActiveItems[category].map((item) => (
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
                  </div>
                </div>
              ))}

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div className="space-y-2 mt-6">
                  <Collapsible open={isCompletedOpen} onOpenChange={setIsCompletedOpen}>
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-2 p-0 h-auto font-medium text-primary uppercase tracking-wide hover:bg-transparent"
                        >
                          <Check size={16} />
                          <span className="text-sm">Completed ({completedItems.length})</span>
                          {isCompletedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                      </CollapsibleTrigger>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearCompletedItems}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Clear completed
                      </Button>
                    </div>
                    <div className="flex-1 h-px bg-border"></div>
                    
                    <CollapsibleContent className="space-y-1 mt-2">
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
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
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
              <CollapsibleContent className="space-y-3 mt-3">
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
                      <div className="flex-1">
                        <span className="text-foreground font-medium group-hover:text-accent-foreground block">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">
                          {item.category || 'Other'}
                        </span>
                      </div>
                      <Plus className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" size={16} />
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