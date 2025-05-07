
type returnedObject = {
    message: string
}

const messages = {
    isString: (value: string): returnedObject => ({ message: value + ' باید رشته متنی باشد' }),
    isBoolean: (value: string): returnedObject => ({ message: value + ' باید بولین باشد' }),
    isEnum: (value: string, theEnum: object): returnedObject => {
        const acceptable = Object.values(theEnum).join(', ');
        return { message: value + ' باید یکی از مقادیر [' + acceptable + '] باشد' };
    },
    isArray: (value: string): returnedObject => ({ message: value + ' باید آرایه باشد' }),
    isPositive: (value: string): returnedObject => ({ message: value + ' باید عدد مثبت باشد' }),
    max: (value: string, maxLength: number): [number, returnedObject] => [maxLength, { message: value + ' نباید بیشتر از ' + maxLength + ' باشد' }],
    min: (value: string, minLength: number): [number, returnedObject] => [minLength, { message: value + ' نباید کمتر از ' + minLength + ' باشد' }],
    maxLength: (value: string, maxLength: number): [number, returnedObject] => [maxLength, { message: value + ' نباید بیشتر از ' + maxLength + ' حرف باشد' }],
    minLength: (value: string, minLength: number): [number, returnedObject] => [minLength, { message: value + ' نباید کمتر از ' + minLength + ' حرف باشد' }],
    notEmpty: (value: string): returnedObject => ({ message: value + ' ضروریست' }),
    email: (): [{}, returnedObject] => [{}, { message: 'ایمیل نامعتبر است' }],
    phone: (): [RegExp, returnedObject] => [/^09\d{9}$/, { message: 'شماره همراه نامعتبر است' }],
}

export default messages