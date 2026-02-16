#!/usr/bin/bash
echo ""
echo -e "\e[97;44m                              \e[0m"
echo -e "\e[97;44m   Initialisation du projet   \e[0m"
echo -e "\e[97;44m                              \e[0m"
echo ""

# Demande du nom du projet
echo -en "\e[1mNom du projet : \e[0m"

while read project_name; do
    if [[ "$project_name" =~ ^[a-z]([-_]?[a-z0-9]+)+$ ]]; then break; fi

    echo ""
    echo -e "\e[97;41m                     \e[0m"
    echo -e "\e[97;41m   Nom incorrect !   \e[0m"
    echo -e "\e[97;41m                     \e[0m"
    echo -e "\e[1;33m"
    echo -e "Le nom du projet doit suivre les règles suivantes :\e[0m"
    echo -e "- Mesurer au moins 2 caractères"
    echo -e "- Ne contenir que des minuscules non-accentuées, des chiffres, des \e[1;34m-\e[0m ou des \e[1;34m_\e[0m"
    echo -e "- Commencer par une minuscule non-accentuée"
    echo -e "- Ne pas terminer par \e[1;34m-\e[0m ou \e[1;34m_\e[0m"
    echo ""
    echo -n ": "
done

# Écriture du nom du projet dans docker-compose.yml et package JSON
sed "s/<<PROJECT_NAME>>/$project_name/" -i ./docker-compose.yml
sed "s/<<PROJECT_NAME>>/$project_name/" -i ./app/package.json

# Message de succés
echo ""
echo -e "\e[97;42m                        \e[0m"
echo -e "\e[97;42m   Projet Configuré !   \e[0m"
echo -e "\e[97;42m                        \e[0m"
echo -e "\e[1;33m"
echo -e "Prochaines étapes :\e[0m"
echo -e "- lancer la commande \e[1;34mdocker compose up\e[0m"
echo -e "- Commencer à coder ;)"
echo ""
