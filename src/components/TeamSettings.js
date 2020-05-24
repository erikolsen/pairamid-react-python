import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../constants'
import RoleSettings from './RoleSettings'
import UserSettings from './UserSettings'

const TeamSettings = () => {
    const [roles, setRoles] = useState([])

    useEffect(()=> {
        axios.get(`${API_URL}/roles`)
            .then((response)=> {
                setRoles(response.data)
            })
    }, [])

    return (
        <main className="bg-gray-light col-span-7 p-2 lg:p-12 h-full">
            <section>
                <header className='border-b-2 border-gray-border flex flex-wrap justify-between items-baseline py-2 mb-4'>
                    <div className='w-full flex justify-between items-center'>
                        <h1>Team Settings</h1>
                    </div>
                </header>
                <div className='w-full'>
                    <RoleSettings roles={roles} setRoles={setRoles} />
                    <div className='border-b-2 border-gray-border my-4' />
                    <UserSettings roles={roles} />
                </div>
            </section>
        </main>

    )
}

export default TeamSettings