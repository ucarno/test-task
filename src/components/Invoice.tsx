import styled from "styled-components";
import Input from "./Input";
import {ChangeEvent, useState} from "react";
import {IInvoiceItem} from "../interfaces/IInvoiceItem";
import InvoiceItem from "./InvoiceItem";

const InvoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  
  padding: 16px;
  
  width: 600px;
  min-height: 600px;
  
  hr {width: 100%;}
`
const InvoiceSavedContainer = styled.div`
  width: 400px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: forestgreen;
`

const parseDate = (date: Date) => {
    const values = [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0')
    ]
    return values.join('-')
}
const parseOffsetDate = (date: Date, offsetInDays: number) => {
    date = new Date(date.getTime() + offsetInDays * 24 * 60 *60000)
    return parseDate(date)
}

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  row-gap: 12px;
`
const ItemsErrorContainer = styled.div`
  color: red;
  text-align: center;
`

const Invoice = () => {
    const [client, setClient] = useState('')
    const [clientTouched, setClientTouched] = useState(false)

    const [date, setDate] = useState(() => parseDate(new Date()))
    const [dueDate, setDueDate] = useState(() => parseOffsetDate(new Date(), 7))

    const [itemsCounter, setItemsCounter] = useState(0)
    const [items, setItems] = useState<{[key: string]: IInvoiceItem}>({})
    const [itemsError, setItemsError] = useState<string | null>(null)

    const [saved, setSaved] = useState(false)

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value)
        setDueDate(parseOffsetDate(new Date(e.target.valueAsDate!), 7))
    }
    const handleDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDueDate(e.target.value)
    }

    const handleAddNew = () => {
        setItemsError(null)
        setItemsCounter(n => n + 1)
        setItems(oldItems => ({
            ...oldItems, ...{
                [itemsCounter]: {
                    description: '',
                    descriptionTouched: false,
                    count: '1',
                    price: '0.00',
                }
            }
        }))
    }

    const handleItemUpdate = (itemId: string, data: Partial<IInvoiceItem>) => {
        setItems(oldItems => {
            const modified = {...oldItems[itemId], ...data}
            return {...oldItems, ...{[itemId]: modified}}
        })
    }
    const handleItemRemove = (itemId: string) => {
        setItems(oldItems => {
            const copied = Object.assign({}, oldItems)
            delete copied[itemId]
            return copied
        })
    }

    const handleSave = () => {
        if (!clientTouched) {setClientTouched(true)}

        // check if no items at all
        if (Object.entries(items).length === 0) {
            setItemsError('Arveread puuduvad!')
            return
        }

        // check if there are invalid items...
        const invalidItems = Object.keys(items).reduce((previous, key) => {
            if (items[key].description === '') {
                return {...previous, ...{[key]: {...items[key], descriptionTouched: true}}}
            }
            return previous
        }, {});

        // ...and if there are, show it
        if (Object.entries(invalidItems).length > 0) {
            setItems(oldItems => ({...oldItems, ...invalidItems}))
        } else {
            // at last check if client name added
            setSaved(!!client)
        }
    }

    if (saved) {
        return (
            <InvoiceSavedContainer>
                Salvestamine õnnestus
            </InvoiceSavedContainer>
        )
    }

    const totalAmount = Object.entries(items).reduce((previous, [_, item]) => {
        const count = parseInt(item.count)
        const price = parseFloat(item.price)

        if (!isNaN(count) && !isNaN(price)) {
            return previous + count * price
        }
        return previous
    }, 0).toFixed(2)

    return (
        <InvoiceContainer>
            <Input
                label='Kliendi nimi'
                placeholder='Dmitri Romanov'
                maxLength={32}
                value={client}
                onFocus={() => {if (!clientTouched) {setClientTouched(true)}}}
                onChange={e => {setClient(e.target.value.trimStart().replace(/ {2,}/, ' '))}}
                onBlur={() => {setClient(c => c.trimEnd())}}
                error={!client && clientTouched ? 'Kliendi nimi ei või olla tühi' : undefined}
                required
            />
            <Input label='Kuupäev' type='date' value={date} onChange={handleDateChange}/>
            <Input label='Maksetähtpäev' type='date' value={dueDate} onChange={handleDueDateChange}/>

            <hr/>

            <ItemsContainer>
                {itemsError ? (
                    <ItemsErrorContainer>{itemsError}</ItemsErrorContainer>
                ) : null}
                {Object.entries(items).map(([itemId, item]) => (
                    <InvoiceItem key={itemId}
                                 item={item}
                                 handleUpdate={(data: Partial<IInvoiceItem>) => {handleItemUpdate(itemId, data)}}
                                 handleRemove={() => {handleItemRemove(itemId)}}
                    />
                ))}
            </ItemsContainer>
            <button onClick={handleAddNew}>+ Lisa arverida</button>

            <hr/>

            <span>Kogusumma: {totalAmount}€</span>
            <button onClick={handleSave}>Salvesta</button>

        </InvoiceContainer>
    )
}
export default Invoice
