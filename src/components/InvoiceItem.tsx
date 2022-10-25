import {IInvoiceItem} from "../interfaces/IInvoiceItem";
import Input from "./Input";
import {ChangeEvent, FocusEvent} from "react";
import styled from "styled-components";

const ItemContainer = styled.div`
  padding: 6px;
  
  display: flex;
  flex-direction: column;
  row-gap: 4px;

  background-color: #eaeaea;
  border-radius: 4px;
`
const ItemNumbers = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 8px;
`
const ItemFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

interface ItemProps {
    item: IInvoiceItem
    handleUpdate: (update: Partial<IInvoiceItem>) => void
    handleRemove: () => void
}
const InvoiceItem = (props: ItemProps) => {
    const {item, handleUpdate, handleRemove} = props

    const handleDescription = (e: ChangeEvent<HTMLInputElement>) => {
        let description = (
            e.target.value
                .trimStart()  // no spaces at start
                .replace(/[ ]{2,}/, ' ')  // two or more spaces -> one space (eg. '1  2' -> '1 2')
        )
        handleUpdate({description: description})
    }

    // trim end of description
    const handleDescriptionBlur = (e: FocusEvent<HTMLInputElement>) => {
        const trimmed = e.target.value.trimEnd()
        if (trimmed.length !== item.description.length) {
            handleUpdate({description: trimmed})
        }
    }

    const handleCount = (e: ChangeEvent<HTMLInputElement>) => {
        let count = (
            (e.target.value.trim().replace(/^0+/, ''))  // trim + no zeros at the beginning
                .replace(/\D/, '')  // no non-digits
        )
        handleUpdate({count: count})
    }

    const handleCountBlur = () => {
        // count should not be empty
        if (!item.count) {
            handleUpdate({count: '1'})
        }
    }

    const handlePrice = (e: ChangeEvent<HTMLInputElement>) => {
        let price = (
            e.target.value.trim()
                .replace(/[^\d.]/, '')  // no non-digits, allow dots
        )

        if (!price || price === '0') {
            handleUpdate({price: price})
            return
        }

        // do not allow to input anything other than valid float
        price = (
            price.replace(/^0+/, '0')  // trim + no more than one zero at the beginning
                .replace(/^0(?!\.)/, '')  // remove zero (at the start of a string) not followed by dot, but followed by digit (eg. '01' -> '1' and '0.1' -> '0.1')
                .replace(/^\.+/, '')  // remove dot from the beginning
                .replace(/\.{2,}/, '.')  // remove duplicate dots
        )

        // leave only last dot (eg. '53.445.00' -> '53445.00')
        let priceChars = Array.from(price)
        const dotsCount = priceChars.filter(i => i === '.').length
        if (dotsCount > 1) {
            for (let i = 0; i < (dotsCount - 1); i++) {
                priceChars.splice(priceChars.indexOf('.'), 1)
            }
            price = priceChars.join('')
        }

        // maximum two fraction digits
        if (dotsCount > 0) {
            const placesToRemove = priceChars.length - priceChars.indexOf('.') - 3
            if (placesToRemove > 0) {
                const dotIndex = priceChars.indexOf('.')
                priceChars.splice(dotIndex + 3, placesToRemove)
                price = priceChars.join('')
            }
        }

        handleUpdate({price: price})
    }

    const handlePriceBlur = () => {
        // price should not be empty
        if (!item.price || item.price === '0') {
            handleUpdate({price: '0.00'})
            return
        }

        // we always check if there are two decimal places in price and add them if needed
        // but do not exceed limit of 8 characters
        const withFraction = parseFloat(item.price).toFixed(2)
        if (withFraction.length <= 8 && withFraction.length !== item.price.length) {
            handleUpdate({price: parseFloat(item.price).toFixed(2)})
        }
    }

    const parsedPrice = parseFloat(item.price)
    const parsedCount = parseInt(item.count)
    const numbersValid = !isNaN(parsedPrice) && !isNaN(parsedCount)

    let amount
    if (numbersValid) {
        // calculate amount AND fix floating point math error (eg. 0.1 + 0.2 != 0.3)
        amount = (parsedCount * parsedPrice).toFixed(2)
    }

    return (
        <ItemContainer>
            <Input
                label='Kirjeldus'
                placeholder='Kirjeldus...'
                value={item.description}
                maxLength={32}
                onChange={handleDescription}
                onFocus={() => (!item.descriptionTouched ? handleUpdate({descriptionTouched: true}) : null)}
                onBlur={handleDescriptionBlur}
                error={!item.description && item.descriptionTouched ? 'Kirjeldus ei või olla tühi' : undefined}
            />
            <ItemNumbers>
                <Input label='Kogus'
                       value={item.count}
                       maxLength={8}
                       onChange={handleCount}
                       onBlur={handleCountBlur}
                />
                <Input label='Hind'
                       value={item.price}
                       maxLength={8}
                       onChange={handlePrice}
                       onBlur={handlePriceBlur}
                />
            </ItemNumbers>
            <ItemFooter>
                <span>Summa: {amount ? (amount + '€') : '...'}</span>
                <button onClick={handleRemove}>Kustuta</button>
            </ItemFooter>
        </ItemContainer>
    )
}
export default InvoiceItem
