import React from 'react'

export default function Select({options, onChange}){
    return (
            (options.length === 0) ? null
            :
            <select onChange={onChange}>
                <option value />
                {options.map((content, index) => <option value={content} key={`o-${index}`}>{content}</option>)}
            </select>
    )
}