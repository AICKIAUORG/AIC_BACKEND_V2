import { PaginationDto } from "../dto/pagination.dto"
import * as moment from 'moment-jalaali';

export function isBoolean(value : any){
    return [true , "true", "True", false , "false", "False"].includes(value)
}
export function toBoolean(value : any){
    return [true , "true", "True"].includes(value) ? true :
        [false , "false", "False", ""].includes(value) ? false :
        value
}
export function toMG(value : number){
    return (value * 1024 * 1024)
}

export function paginationSolver(paginationDto : PaginationDto){
    let { limit, page } = paginationDto
    if(!limit || limit < 10 ) limit = 10
    else if(limit > 100) limit = 100
    if(!page || page <= 1 ) page = 0
    else if(page > 1) page -= 1
    return {
        page,
        limit,
        skip : page * limit
    }
}
export function PaginationGenerator(
    page : number,
    limit : number,
    count : number,
){
    return {
        total_count : Math.ceil(count / limit),
        page : page + 1,
        limit,
        skip : page * limit,
    }
}
export function DateConvertor(date : string){
      const m = moment(date, 'jYYYY/jMM/jDD HH:mm')
      if(!m.isValid()){
        throw new Error('تاریخ شمسی نامعتبر است');
    }
    return m.format('YYYY/MM/DD HH:mm')
}
console.log(moment().format('jYYYY/jMM/jDD'));