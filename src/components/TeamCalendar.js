import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import axios from 'axios'
import { API_URL } from '../constants'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faBan } from '@fortawesome/free-solid-svg-icons'

const localDate = date => date ? date.toLocaleDateString('en-US') : ''
const spanOfDays = (d1, d2) => (localDate(d1) !== localDate(d2))

const IconButton = ({action, icon, classes}) => {
    const onClick = (e) => { e.preventDefault(); action() }

    return (
        <button className={`${classes}`} onClick={onClick}>
            <FontAwesomeIcon icon={icon} />
        </button>
    )
}

const EditCard = ({onUpdate, team, date, onDelete, setRangeSelect}) => {
    const { register, handleSubmit, errors } = useForm()
    const [selected, setSelected] = useState('')
    const [weekly, setWeekly] = useState(false)
    const classes = errors.message ? 'border border-red' : 'border border-gray-border '

    return (
        <div className='bg-white shadow-lg rounded-lg p-4 col-span-1 relative'>
            <form onSubmit={handleSubmit(onUpdate)}>
                <div className='flex justify-between items-center'>
                    <div className='font-semibold mb-4'>
                        <span>Add Reminder for </span>
                        <ReminderDates 
                            startDate={localDate(date[0])} 
                            endDate={localDate(date[1])} 
                            recuring={weekly} 
                        />
                    </div>
                </div>

                <div className='relative'>
                    <select 
                        onChange={(e) => setSelected(e.target.value)} 
                        name='userId' 
                        value={selected} 
                        ref={register} 
                        className="block appearance-none w-full bg-white border border-gray-border pl-2 py-2 pr-8 rounded leading-tight"
                    >
                        <option value=''>Select a User</option>
                        { team.users.map((user) => <option key={user.id} className='' value={user.id}>{user.username}</option> ) }
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 py-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>

                <div className='my-4'>
                    <p>Reminder Message</p>
                    <input 
                        className={`w-full p-2 leading-normal outline-none ${classes}`}
                        id='message' 
                        type='text' 
                        name='message' 
                        placeholder='Message' 
                        defaultValue={'Out of Office'} 
                        ref={register({required: true})} 
                    />
                    { errors.message && <p className='text-red'>Message is required</p> }
                </div>

                <div className='my-4 flex justify-between'>
                    <label className="flex justify-start items-start">
                        <div className="bg-white border-2 rounded border-gray-400 w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500">
                            <input onClick={()=> setWeekly(!weekly)} type="checkbox" className="opacity-0 absolute" name='repeatWeekly' ref={register} />
                            <svg className="fill-current hidden w-4 h-4 text-green-500 pointer-events-none" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                        </div>
                        <div className="select-none">Repeat Weekly</div>
                    </label>

                </div>

                <div className='flex justify-between'>
                    <IconButton action={()=> onDelete()} icon={faBan} classes='' /> 
                    <input className='px-4 border border-green rounded text-white bg-green text-xs font-bold' type="submit" value='Save'/>
                </div>
            </form>
        </div>
    )
}

const ReminderDates = ({startDate, endDate, recuring})=> {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const dayOfWeek = days[new Date(startDate).getDay()-1]

    if(recuring){
        return (
            <div>Every {dayOfWeek}</div>
        )
    } else {
        return (
            <div>
                <span>{startDate}</span>
                {(endDate && startDate !== endDate) && <span>-{endDate}</span>}
            </div>
        )
    }
}

const DisplayCard = ({onDelete, reminder}) => {
    const color = reminder.user ? reminder.user.role.color : 'gray'

    return (
        <div className='bg-white shadow-lg rounded-lg mb-4 col-span-1 flex justify-between'>
            <div className='flex'>
                <div style={{'backgroundColor': color}} className={`my-4 bg-gray-med w-12 h-12 mx-2 border-gray-border rounded-full flex items-center justify-center`}>
                    <p className="text-white font-bold text-xs">{reminder.user ? reminder.user.username : 'TEAM'}</p>
                </div>
                <div className='my-4'>
                    <p className='text-lg font-semibold mx-2 flex items-center text-gray'>{reminder.message}</p>
                    <div className='text-sm mx-2 flex justify-between'>
                        <ReminderDates 
                            startDate={reminder.start_date} 
                            endDate={reminder.end_date} 
                            recuring={reminder.recuring_weekday} 
                        />
                    </div>
                </div>
            </div>
            <div className='flex items-center'>
                <IconButton action={()=> onDelete(reminder.id)} icon={faTrashAlt} classes='my-2 mx-4 text-red' /> 
            </div>
        </div>
    )
}

const TeamCalendar = () => {
    const { teamId } = useParams()
    const [team, setTeam] = useState({name: '', users: []})
    const [date, setDate] = useState([new Date(), new Date()])
    const [reminders, setReminders] = useState([])
    const [addable, setAddable] = useState(null)
    const [rangeSelect, setRangeSelect] = useState(false)

    useEffect(()=> {
        let startDate = date[0].toISOString()
        let endDate = date[1].toISOString()
        axios.get(`${API_URL}/team/${teamId}`).then((response)=> { setTeam(response.data) })
        axios.get(`${API_URL}/team/${teamId}/reminders?startDate=${startDate}&endDate=${endDate}`)
            .then((response)=> {
                setReminders(response.data)
            })
    }, [teamId, date])

    const onUpdate = (data)=> {
        const payload = {
            ...data, 
            startDate: date[0].toISOString(), 
            endDate: date[1].toISOString(),
            teamId: teamId
        }
        axios.post(`${API_URL}/team/${teamId}/reminder`, payload)
            .then((response)=> {
                setAddable(null)
                setReminders([response.data, ...reminders])
            })
    }

    const onDelete = (id) => {
        if(id){
            axios.delete(`${API_URL}/team/${teamId}/reminder/${id}`)
                .then((response) => {
                    setReminders(reminders.filter((reminder) => reminder.id !== parseInt(response.data)))
                })
        } else {
            setAddable(false)
        }
    }


    return (
        <main className="bg-gray-light col-span-7 p-2 lg:p-12 h-screen">
            <section>
                <header className='border-b-2 border-gray-border flex flex-wrap justify-between items-baseline py-2 mb-4'>
                    <div className='w-full flex justify-between items-center'>
                        <h1>Calendar and Reminders</h1>
                    </div>
                </header>
                <div className='grid grid-cols-1 md:grid-cols-2 col-gap-4'>
                    <div className='bg-white shadow-lg rounded-lg p-4 col-span-1 mb-2'>
                        <p className='font-bold text-xl mb-2 text-center'>{team.name} Calendar</p>
                        <div className='flex justify-center'>
                            <Calendar 
                                className='p-2'
                                calendarType='US'
                                onChange={(e)=> setDate(e)} 
                                selectRange={rangeSelect}
                                returnValue='range'
                                value={date}
                            />
                        </div>
                        { rangeSelect && <p className='text-center my-4'>First click will select start date. Second click will select end date. Third click will set a new start date.</p> }
                    </div>

                    <div className=''>
                        <div className='grid grid-cols-1'>
                            <div className='bg-white shadow-lg rounded-lg p-3 mb-2'>
                                <p className='font-bold text-center text-xl'>
                                    Reminders for <span>{localDate(date[0])}</span>
                                    {spanOfDays(date[0], date[1]) && <span>-{localDate(date[1])}</span>}
                                </p>
                                <div className='flex justify-between items-center'>
                                    <label className="flex items-center justify-center">
                                        <div className="bg-white border-2 rounded border-gray-400 w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500">
                                            <input onClick={()=> setRangeSelect(!rangeSelect)} type="checkbox" className="opacity-0 absolute" name='repeatWeekly' />
                                            <svg className="fill-current hidden w-4 h-4 text-green-500 pointer-events-none" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                        </div>
                                        <div className="select-none">Select Range</div>
                                    </label>
                                    <button className='focus:outline-none' onClick={(e) => setAddable(!addable)}>
                                        <p className='text-3xl text-gray'>&#8853;</p> 
                                    </button>
                                </div>
                            </div>
                            { addable && <EditCard team={team} onUpdate={onUpdate} onDelete={onDelete} date={date} setRangeSelect={() => setRangeSelect(!rangeSelect)} /> }
                            { reminders.map((reminder)=> <DisplayCard key={reminder.id} reminder={reminder} onDelete={onDelete} /> ) } 
                        </div>
                    </div>
                </div>
            </section>
        </main>

    )
}

export default TeamCalendar