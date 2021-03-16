import React from 'react';
import {
    ScatterChart, 
    Scatter, 
    XAxis, 
    YAxis, 
    ZAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns'

const formatXAxis = (tickItem) => {
    return format(new Date(tickItem), 'MM/dd/yyyy')
  }

const dateToInt = (date) => {
    return new Date(date).getTime()
}

const SimpleScatterChart = ({data}) => {
    data = data.map(d => ({...d, date: dateToInt(d.date)}))
    const min = Math.min(...data.map(d => d.z))
    const max = Math.max(...data.map(d => d.z))

    return (
        <ResponsiveContainer width='100%' height={400}>
            <ScatterChart margin={{ top: 20, right: 100, bottom: 20, left: 100 }}>
                <CartesianGrid />
                <XAxis padding={{left: 20, right: 20}} domain={['auto','auto']} dataKey='date' type='number' name='date' scale='time' tickFormatter={formatXAxis} />
                <YAxis allowDuplicatedCategory={false} dataKey='name' type='category' name='name' />
                <ZAxis dataKey='z' range={[min*100, max*100]} name='quantity' />
                <Scatter name='Feedback Tags' data={data} fill='#8884d8' />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            </ScatterChart>
        </ResponsiveContainer>
    );
}

export default SimpleScatterChart