
type returnedObject = {
    message: string
}

const messages = {
    isString: (value: string): returnedObject => ({ message: value + ' باید رشته متنی باشد' }),
    isArray: (value: string): returnedObject => ({ message: value + ' باید آرایه باشد' }),
    max: (value: string, maxLength: number): [number, returnedObject] => [maxLength, { message: value + ' نباید بیشتر از ' + maxLength + ' حرف باشد' }],
    min: (value: string, minLength: number): [number, returnedObject] => [minLength, { message: value + ' نباید کمتر از ' + minLength + ' حرف باشد' }],
    notEmpty: (value: string): returnedObject => ({ message: value + ' ضروریست' }),
    email: (): [{}, returnedObject] => [{}, { message: 'ایمیل نامعتبر است' }],
    phone: (): [RegExp, returnedObject] => [/^09\d{9}$/, { message: 'شماره همراه نامعتبر است' }],
}

export default messages