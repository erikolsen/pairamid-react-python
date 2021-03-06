import React from 'react'
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

const SignOut = () => {
    const history = useHistory()

    const onClick = () => {
        localStorage.removeItem('currentUser')
        history.push(`/login`)
    }
    return (
        <div className=''>
            <button onClick={onClick}>
                <FontAwesomeIcon className='mr-2' icon={faSignOutAlt} />
                Sign Out
            </button>
        </div>
    )
}

export default SignOut
