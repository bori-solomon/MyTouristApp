export type Locale = "en" | "ru" | "ua" | "ja";

export type Dictionary = {
    common: {
        loading: string;
        save: string;
        cancel: string;
        delete: string;
        confirmDelete: string;
        unknownDate: string;
    };
    nav: {
        title: string;
        search: string;
    };
    dashboard: {
        title: string;
        subtitle: string;
        newTrip: string;
        noTrips: string;
        startCreate: string;
        sort: {
            label: string;
            created: string;
            date: string;
            destination: string;
        };
        fields: {
            destination: string;
            date: string;
            dueDate: string;
            participants: string;
            setDate: string;
            setDueDate: string;
            addPeople: string;
        }
    };
    destination: {
        back: string;
        viewPlan: string;
        documents: string;
        noDocuments: string;
        upload: string;
        uploading: string;
        addCategory: string;
        tabs: {
            visaDocs: string;
            attractions: string;
            airTickets: string;
            hotels: string;
            transport: string;
            plan: string;
        };
        plan: {
            title: string;
            addItem: string;
            itemTitle: string;
            location: string;
            startDate: string;
            endDate: string;
            notes: string;
            links: string;
            empty: string;
        };
        attractions: {
            title: string;
            add: string;
            placeholder: string;
            empty: string;
        }
    };
};

export const dictionaries: Record<Locale, Dictionary> = {
    en: {
        common: {
            loading: "Loading...",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            confirmDelete: "Are you sure you want to delete this file?",
            unknownDate: "Unknown date"
        },
        nav: {
            title: "My Tourist App",
            search: "Search"
        },
        dashboard: {
            title: "Your Trips",
            subtitle: "Manage your travel plans and documents",
            newTrip: "New Trip",
            noTrips: "No trips found",
            startCreate: "Start by creating your first destination.",
            sort: {
                label: "Sort by:",
                created: "Created",
                date: "Travel Date",
                destination: "Destination"
            },
            fields: {
                destination: "Destination",
                date: "Travel Date",
                dueDate: "Due Date",
                participants: "Participants",
                setDate: "Set Date",
                setDueDate: "Set Due Date",
                addPeople: "Add People"
            }
        },
        destination: {
            back: "Back",
            viewPlan: "View Plan",
            documents: "documents",
            noDocuments: "No documents uploaded yet.",
            upload: "Upload File",
            uploading: "Uploading...",
            addCategory: "Add",
            tabs: {
                visaDocs: "Visa/Docs",
                attractions: "Attractions",
                airTickets: "Air Tickets",
                hotels: "Hotels",
                transport: "Transport",
                plan: "Trip Plan"
            },
            plan: {
                title: "Trip Plan",
                addItem: "Add Activity",
                itemTitle: "Activity Title",
                location: "Location",
                startDate: "Start Date",
                endDate: "End Date",
                notes: "Notes",
                links: "Links",
                empty: "No activities planned yet. Start by adding your first stop!"
            },
            attractions: {
                title: "Attractions",
                add: "Add",
                placeholder: "Add new attraction...",
                empty: "No attractions added yet."
            }
        }
    },
    ru: {
        common: {
            loading: "Загрузка...",
            save: "Сохранить",
            cancel: "Отмена",
            delete: "Удалить",
            confirmDelete: "Вы уверены, что хотите удалить этот файл?",
            unknownDate: "Неизвестная дата"
        },
        nav: {
            title: "Мой Турист",
            search: "Поиск"
        },
        dashboard: {
            title: "Ваши Поездки",
            subtitle: "Управляйте планами и документами",
            newTrip: "Новая Поездка",
            noTrips: "Поездки не найдены",
            startCreate: "Начните с создания вашего первого направления.",
            sort: {
                label: "Сортировка:",
                created: "Создано",
                date: "Дата",
                destination: "Направление"
            },
            fields: {
                destination: "Направление",
                date: "Дата",
                dueDate: "Срок (Due Date)",
                participants: "Участники",
                setDate: "Ук. дату",
                setDueDate: "Ук. срок",
                addPeople: "Добавить"
            }
        },
        destination: {
            back: "Назад",
            viewPlan: "Открыть",
            documents: "документов",
            noDocuments: "Документы еще не загружены.",
            upload: "Загрузить",
            uploading: "Загрузка...",
            addCategory: "Добавить",
            tabs: {
                visaDocs: "Визы/Документы",
                attractions: "Достопримечательности",
                airTickets: "Авиабилеты",
                hotels: "Отели",
                transport: "Транспорт",
                plan: "План поездки"
            },
            plan: {
                title: "План поездки",
                addItem: "Добавить активность",
                itemTitle: "Заголовок",
                location: "Место",
                startDate: "Дата начала",
                endDate: "Дата окончания",
                notes: "Заметки",
                links: "Ссылки",
                empty: "План пока пуст. Начните с первой активности!"
            },
            attractions: {
                title: "Достопримечательности",
                add: "Добавить",
                placeholder: "Новое место...",
                empty: "Список пуст."
            }
        }
    },
    ua: {
        common: {
            loading: "Завантаження...",
            save: "Зберегти",
            cancel: "Скасувати",
            delete: "Видалити",
            confirmDelete: "Ви впевнені, що хочете видалити цей файл?",
            unknownDate: "Невідома дата"
        },
        nav: {
            title: "Мій Турист",
            search: "Пошук"
        },
        dashboard: {
            title: "Ваші Подорожі",
            subtitle: "Керуйте планами та документами",
            newTrip: "Нова Подорож",
            noTrips: "Подорожей не знайдено",
            startCreate: "Почніть зі створення вашого першого напрямку.",
            sort: {
                label: "Сортування:",
                created: "Створено",
                date: "Дата подорожі",
                destination: "Напрямок"
            },
            fields: {
                destination: "Напрямок",
                date: "Дата подорожі",
                dueDate: "Термін (Due Date)",
                participants: "Учасники",
                setDate: "Вст. дату",
                setDueDate: "Вст. термін",
                addPeople: "Додати"
            }
        },
        destination: {
            back: "Назад",
            viewPlan: "Відкрити",
            documents: "документів",
            noDocuments: "Документи ще не завантажені.",
            upload: "Завантажити",
            uploading: "Завантаження...",
            addCategory: "Додати",
            tabs: {
                visaDocs: "Візи/Документи",
                attractions: "Пам'ятки",
                airTickets: "Авіаквитки",
                hotels: "Готелі",
                transport: "Транспорт",
                plan: "План поїздки"
            },
            plan: {
                title: "План поїздки",
                addItem: "Додати активність",
                itemTitle: "Заголовок",
                location: "Місце",
                startDate: "Дата початку",
                endDate: "Дата закінчення",
                notes: "Нотатки",
                links: "Посилання",
                empty: "План поки порожній. Почніть з першої активності!"
            },
            attractions: {
                title: "Пам'ятки",
                add: "Додати",
                placeholder: "Нове місце...",
                empty: "Список порожній."
            }
        }
    },
    ja: {
        common: {
            loading: "読み込み中...",
            save: "保存",
            cancel: "キャンセル",
            delete: "削除",
            confirmDelete: "このファイルを削除してもよろしいですか？",
            unknownDate: "不明な日付"
        },
        nav: {
            title: "マイツーリストアプリ",
            search: "検索"
        },
        dashboard: {
            title: "あなたの旅行",
            subtitle: "旅行計画とドキュメントを管理",
            newTrip: "新しい旅行",
            noTrips: "旅行が見つかりません",
            startCreate: "最初の目的地を作成することから始めましょう。",
            sort: {
                label: "並び替え:",
                created: "作成日",
                date: "旅行日",
                destination: "目的地"
            },
            fields: {
                destination: "目的地",
                date: "旅行日",
                dueDate: "期日",
                participants: "参加者",
                setDate: "日付を設定",
                setDueDate: "期日を設定",
                addPeople: "追加"
            }
        },
        destination: {
            back: "戻る",
            viewPlan: "プランを表示",
            documents: "ドキュメント",
            noDocuments: "ドキュメントはまだアップロードされていません。",
            upload: "ファイルをアップロード",
            uploading: "アップロード中...",
            addCategory: "追加",
            tabs: {
                visaDocs: "ビザ/書類",
                attractions: "観光スポット",
                airTickets: "航空券",
                hotels: "ホテル",
                transport: "交通機関",
                plan: "旅行計画"
            },
            plan: {
                title: "旅行計画",
                addItem: "アクティビティを追加",
                itemTitle: "タイトル",
                location: "場所",
                startDate: "開始日",
                endDate: "終了日",
                notes: "メモ",
                links: "リンク",
                empty: "計画はまだありません。最初のアクティビティを追加しましょう！"
            },
            attractions: {
                title: "観光スポット",
                add: "追加",
                placeholder: "新しい場所...",
                empty: "観光スポットはまだ追加されていません。"
            }
        }
    }
};
