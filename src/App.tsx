import React, { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check, ShoppingCart, Package } from "@phosphor-icons/react"
import deleteIcon from "./assets/delete.png"
import downIcon from "./assets/down.png"
import cannedFoodIcon from "./assets/canned-food.png"
import freshProduceIcon from "./assets/fresh-produce.png"
import personalHygieneIcon from "./assets/personal-hygiene.png"

interface GroceryItem {
  id: string
  name: string
  completed: boolean
  addedAt: number
  category: string
}

// Grocery store categories organized by physical store layout
const GROCERY_CATEGORIES = [
  'Produce',
  'Bakery',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Deli',
  'Canned Goods',
  'Pantry & Dry Goods',
  'Frozen Foods',
  'Beverages',
  'Snacks',
  'Personal Care',
  'Household & Cleaning',
  'Other'
]

// Get appropriate icon for each category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Produce':
      return <img src={freshProduceIcon} alt="Produce" className="w-4 h-4" />
    case 'Canned Goods':
      return <img src={cannedFoodIcon} alt="Canned Goods" className="w-4 h-4" />
    case 'Personal Care':
      return <img src={personalHygieneIcon} alt="Personal Care" className="w-4 h-4" />
    default:
      return <Package className="text-primary" size={16} />
  }
}

const categorizeItemWithLLM = async (itemName: string): Promise<string> => {
  try {
    const prompt = spark.llmPrompt`You are categorizing a grocery item for a shopping list app. 

Item to categorize: "${itemName}"

Available categories (choose ONE that best fits):
- Produce (fresh fruits, vegetables, herbs, onions)
- Bakery (bread, pastries, baked goods)
- Dairy & Eggs (milk, cheese, yogurt, eggs, butter)
- Meat & Seafood (fresh/raw meat, fish, poultry)
- Deli (sliced meats, prepared foods, rotisserie chicken)
- Canned Goods (canned soups, vegetables, beans, sauces)
- Pantry & Dry Goods (rice, pasta, spices, condiments, boxed items)
- Frozen Foods (frozen meals, ice cream, frozen vegetables)
- Beverages (drinks, juices, coffee, tea)
- Snacks (chips, crackers, candy, nuts)
- Personal Care (shampoo, soap, toothpaste, hygiene items)
- Household & Cleaning (detergent, paper towels, cleaning supplies)
- Other (anything that doesn't fit the above)

Consider the item's typical location in a grocery store and how it's packaged/sold.

Examples:
- "chicken noodle soup" → Canned Goods (because it's typically sold in cans)
- "rotisserie chicken" → Deli (because it's prepared/cooked)
- "raw chicken breast" → Meat & Seafood (because it's fresh/raw)
- "frozen pizza" → Frozen Foods
- "pizza dough" → Bakery or Dairy & Eggs (depending on where sold)

Return ONLY the category name, no explanation.`

    const category = await spark.llm(prompt, 'gpt-4o-mini')
    
    // Validate the response is one of our categories
    if (GROCERY_CATEGORIES.includes(category.trim())) {
      return category.trim()
    }
    
    // Fallback to simple categorization if LLM returns invalid category
    return categorizeItemSimple(itemName)
  } catch (error) {
    console.error('LLM categorization failed:', error)
    // Fallback to simple categorization
    return categorizeItemSimple(itemName)
  }
}

// Simplified fallback categorization
const categorizeItemSimple = (itemName: string): string => {
  const lowerName = itemName.toLowerCase()
  
  // Simple keyword matching for fallback
  if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || lowerName.includes('egg') || lowerName.includes('butter')) {
    return 'Dairy & Eggs'
  }
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('meat')) {
    return 'Meat & Seafood'
  }
  if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange') || lowerName.includes('lettuce') || lowerName.includes('tomato')) {
    return 'Produce'
  }
  if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('donut') || lowerName.includes('muffin')) {
    return 'Bakery'
  }
  if (lowerName.includes('frozen')) {
    return 'Frozen Foods'
  }
  if (lowerName.includes('canned') || lowerName.includes('soup') || lowerName.includes('sauce')) {
    return 'Canned Goods'
  }
  if (lowerName.includes('shampoo') || lowerName.includes('soap') || lowerName.includes('toothpaste')) {
    return 'Personal Care'
  }
  if (lowerName.includes('detergent') || lowerName.includes('cleaner') || lowerName.includes('paper towel')) {
    return 'Household & Cleaning'
  }
  
  return 'Other'
}

function App() {
  const [currentList, setCurrentList] = useKV<GroceryItem[]>('grocery-current-list', [])
  const [pastItems, setPastItems] = useKV<GroceryItem[]>('grocery-past-items', [])
  const [newItemName, setNewItemName] = useState('')
  const [isPastItemsOpen, setIsPastItemsOpen] = useState(false)
  const [isCompletedOpen, setIsCompletedOpen] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Migrate existing items to include categories
  useEffect(() => {
    const migrateItems = async (items: GroceryItem[]) => {
      const updatedItems = []
      for (const item of items) {
        if (!item.category) {
          const category = await categorizeItemWithLLM(item.name)
          updatedItems.push({ ...item, category })
        } else {
          updatedItems.push(item)
        }
      }
      return updatedItems
    }

    const migrate = async () => {
      if (currentList.some(item => !item.category)) {
        const migrated = await migrateItems(currentList)
        setCurrentList(migrated)
      }
      if (pastItems.some(item => !item.category)) {
        const migrated = await migrateItems(pastItems)
        setPastItems(migrated)
      }
    }

    migrate()
  }, [currentList, pastItems, setCurrentList, setPastItems])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addItem = async () => {
    if (!newItemName.trim() || isAddingItem) return
    
    setIsAddingItem(true)
    
    try {
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

      // Use LLM to categorize the item
      const category = await categorizeItemWithLLM(trimmedName)

      const newItem: GroceryItem = {
        id: Date.now().toString(),
        name: trimmedName,
        completed: false,
        addedAt: Date.now(),
        category
      }

      setCurrentList([...currentList, newItem])
      setNewItemName('')
      inputRef.current?.focus()
    } finally {
      setIsAddingItem(false)
    }
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
            setPastItems([...pastItems, { ...updatedItem, completed: false, category: item.category || 'Other' }])
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

  const addFromPastItems = async (pastItem: GroceryItem) => {
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
      category: pastItem.category || await categorizeItemWithLLM(pastItem.name)
    }

    setCurrentList([...currentList, newItem])
  }

  const clearCompletedItems = () => {
    setCurrentList(currentList.filter(item => !item.completed))
  }

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await addItem()
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
  const categoryOrder = ['Produce', 'Bakery', 'Dairy & Eggs', 'Meat & Seafood', 'Deli', 'Canned Goods', 'Pantry & Dry Goods', 'Frozen Foods', 'Beverages', 'Snacks', 'Personal Care', 'Household & Cleaning', 'Other']
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
              disabled={isAddingItem}
            />
            <Button 
              onClick={addItem}
              disabled={!newItemName.trim() || isAddingItem}
              size="default"
              className="px-3"
            >
              {isAddingItem ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Plus size={20} />
              )}
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
                    {getCategoryIcon(category)}
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
                          <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
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
                          <img 
                            src={downIcon} 
                            alt="Expand" 
                            className={`w-4 h-4 transition-transform duration-200 ${isCompletedOpen ? 'rotate-0' : '-rotate-90'}`} 
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearCompletedItems}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-3.5 h-3.5" />
                        Clear completed
                      </Button>
                    </div>
                    
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
                  <img 
                    src={downIcon} 
                    alt="Expand" 
                    className={`w-5 h-5 transition-transform duration-200 ${isPastItemsOpen ? 'rotate-0' : '-rotate-90'}`} 
                  />
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