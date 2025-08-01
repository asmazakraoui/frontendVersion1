"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, syncNotificationsForCurrentUser } = useNotification();
  const [showNotificationDot, setShowNotificationDot] = useState(false); // Initialiser à false par défaut
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Mettre à jour le point de notification en fonction du nombre de notifications non lues
  useEffect(() => {
    // Mettre à jour le point de notification uniquement en fonction du compteur de non lues
    console.log('🔔 Mise à jour du point de notification - unreadCount:', unreadCount);
    setShowNotificationDot(unreadCount > 0);
    
    if (notifications.length > 0) {
      console.log('📋 Données de notification reçues:', notifications);
      console.log('🔴 Notifications non lues:', unreadCount);
    }
  }, [notifications, unreadCount]);
  
  // Effet pour forcer une vérification des notifications au chargement du composant
  useEffect(() => {
    const checkNotifications = async () => {
      console.log('🔍 Vérification initiale des notifications...');
      try {
        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('🚫 Aucun token trouvé, impossible de vérifier les notifications');
          return;
        }
        
        // Récupérer les notifications
        await fetchNotifications();
        
        // Si aucune notification n'est trouvée, essayer de synchroniser
        if (notifications.length === 0) {
          console.log('🔄 Aucune notification trouvée, tentative de synchronisation...');
          await syncNotificationsForCurrentUser();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des notifications:', error);
      }
    };
    
    checkNotifications();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    
    // Rafraîchir les notifications lorsque le dropdown est ouvert
    if (isOpen === false) { // Ne récupérer que lorsqu'on ouvre le dropdown
      try {
        fetchNotifications();
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
      }
    }
  };
  
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  };

  const handleSyncNotifications = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSyncing(true);
    try {
      await syncNotificationsForCurrentUser();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            showNotificationDot ? "flex" : "hidden"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications {unreadCount > 0 && <span className="ml-2 text-sm font-normal text-orange-500">({unreadCount} non lues)</span>}
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {/* <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg> */}
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucune notification
            </li>
          ) : (
            notifications.map((notification, index) => (
              <li key={notification.id || `notification-${index}`}>
                <DropdownItem
                    onItemClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      closeDropdown();
                    }}
                    className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  >
                    <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {!notification.read && (
                        <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-orange-500 dark:border-gray-900"></span>
                      )}
                    </span>

                    <span className="block">
                      <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                        {notification.type === 'access_denied' && notification.accessLog 
                          ? `Accès refusé pour la carte ${notification.accessLog.cardId}` 
                          : notification.message}
                      </span>

                      <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                        <span>
                          {notification.type === 'access_denied' 
                            ? `Accès refusé${notification.accessLog?.cardId ? ` - Carte ${notification.accessLog.cardId}` : ''}` 
                            : notification.type}
                        </span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>
                          {(() => {
                            try {
                              // Vérifier si la date existe
                              if (!notification.createdAt) return 'il y a quelques secondes';
                              
                              // Essayer de convertir en date
                              const date = new Date(notification.createdAt);
                              
                              // Vérifier si la date est valide
                              if (isNaN(date.getTime())) return 'il y a quelques secondes';
                               // Afficher la date complète pour le débogage
                              //  console.log(`Date de notification (${notification.id}):`, {
                              //   raw: notification.createdAt,
                              //   parsed: date,
                              //   formatted: formatDistanceToNow(date, { addSuffix: true, locale: fr })
                              // });
                              
                              // Formater la date en utilisant la date réelle de l'accessLog si disponible
                              // if (notification.accessLog?.timestamp) {
                              //   const accessLogDate = new Date(notification.accessLog.timestamp);
                              //   if (!isNaN(accessLogDate.getTime())) {
                              //     return formatDistanceToNow(accessLogDate, { addSuffix: true, locale: fr });
                              //   }
                              // }
                              
                              // Formater la date
                              return formatDistanceToNow(date, { addSuffix: true, locale: fr });
                            } catch (error) {
                              console.error('Erreur de formatage de date:', error);
                              return 'il y a quelques secondes';
                            }
                            
                          })()}
                        </span>
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              ))
          )}
        </ul>
        
        {notifications.length > 0 && (
          <div className="flex justify-center mt-3">
            <button 
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              Marquer tout comme lu
            </button>
          </div>
        )}
        
        
        {/* <Link
          href="/"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir toutes les notifications
        </Link> */}
      </Dropdown>
    </div>
  );
}
