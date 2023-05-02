import { useCallback, useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';

import Input from "../Input";
import Modal from "../Modal";

import useLoginModal from "@/hooks/useLoginModal"
import useRegisterModal from "@/hooks/useRegisterModal";



const RegisterModal = () => {
    const  loginModal = useLoginModal();
    const registerModal = useRegisterModal();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] =useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onToggle = useCallback(() => {
        if (isLoading) {
            return;
        }
        registerModal.onClose();
        loginModal.onOpen();
    },[loginModal, registerModal, isLoading]);

    const onSubmit = useCallback(async () => {
        try {
            setIsLoading(true);

            await axios.post('/api/register', {
                email,
                password,
                username,
                name
            });

            console.log(email, password, name, username)
            toast.success('Account created!')
            
            signIn('credentials', {
                email,
                password
            });

            registerModal.onClose();
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    }, [registerModal, email, password, name, username]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Input 
                placeholder="Email"
                onChange={(e)=> setEmail(e.target.value)}
                value={email}
                disabled={isLoading}
            />
            <Input
                placeholder="Name"
                value={name}
                onChange={(e)=> setName(e.target.value)}
                disabled={isLoading}
            />
            <Input
                placeholder="Username"
                value={username}
                onChange={(e)=> setUsername(e.target.value)}
                disabled={isLoading}
            />
            <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                disabled={isLoading}
            />
        </div>
    )

    const footerContent = (
        <div className="text-neutral-400 text-center mt-4">
            <p>
                Already have an account?
                <span 
                onClick={onToggle}
                className="
                    text-white
                    cursor-pointer
                    hover:underline
                    ml-2
                ">
                    Sign In
                </span>
            </p>
        </div>
    )
    return (
    <Modal
        disabled={isLoading}
        isOpen={registerModal.isOpen}
        title="Create an account"
        actionLabel="Register"
        onClose={registerModal.onClose}
        onSubmit={onSubmit}
        body={bodyContent}
        footer={footerContent}
    
    />
      
    
  )
}

export default RegisterModal
